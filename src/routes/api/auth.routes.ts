import { randomUUID } from 'node:crypto'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { sign, verify } from 'hono/jwt'

import { HomeController } from '~/controllers/home.controller'
import { loginDTO } from '~/dtos/users/login.dto'
import { registerDTO } from '~/dtos/users/register.dto'
import { env } from '~/env'
import { TokenService } from '~/services/token.service'
import { UserService } from '~/services/user.service'

const authRoutes = new Hono()

const homeController = new HomeController()
const userService = new UserService()
const tokenService = new TokenService()

const ACCESS_TOKEN_EXPIRY = 15 * 60 // 15 minutes in seconds
const REFRESH_TOKEN_EXPIRY = 6 * 30 * 24 * 60 * 60 // 6 months in seconds

authRoutes.get('/', homeController.healthCheck.bind(homeController))

authRoutes.post('/register', zValidator('json', registerDTO), async (c) => {
  const { email, username, password, passwordConfirmation } = c.req.valid('json')

  const existingByEmail = await userService.findUserByCredential(email)
  const existingByUsername = await userService.findUserByCredential(username)

  if (existingByEmail || existingByUsername) {
    throw new HTTPException(409, { message: 'User already exists.' })
  }

  try {
    await userService.createUser({ email, username, password, passwordConfirmation })

    return c.json({ message: 'User registered successfully!.' }, 201)
  } catch (error) {
    throw new HTTPException(500, { message: 'Failed to register user.' })
  }
})

authRoutes.post('/login', zValidator('json', loginDTO), async (c) => {
  const { credential, password } = c.req.valid('json')

  const user = await userService.findUserByCredential(credential)

  if (!user) {
    throw new HTTPException(401, { message: 'Invalid credentials.' })
  }

  if (!(await userService.verifyPassword(password, user.password))) {
    throw new HTTPException(401, { message: 'Invalid credentials.' })
  }

  const accessJti = randomUUID()
  const refreshJti = randomUUID()

  const accessPayload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY,
    jti: accessJti,
    type: 'access',
  }

  const refreshPayload = {
    id: user.id,
    jti: refreshJti,
    exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRY,
    type: 'refresh',
  }

  const accessToken = await sign(accessPayload, env.JWT_SECRET!)
  const refreshToken = await sign(refreshPayload, env.JWT_SECRET!)

  await tokenService.storeRefreshToken({
    userId: user.id,
    tokenId: refreshJti,
    expiresAt: new Date(refreshPayload.exp * 1000),
    userAgent: c.req.header('User-Agent') || 'unknown',
    ip: c.req.header('X-Forwarded-For') || c.req.header('CF-Connecting-IP') || 'unknown',
  })

  setCookie(c, 'access_token', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: ACCESS_TOKEN_EXPIRY,
    path: '/',
  })

  setCookie(c, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: REFRESH_TOKEN_EXPIRY,
    path: '/',
  })

  return c.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  })
})

authRoutes.post('/refresh', async (c) => {
  try {
    const refreshToken = getCookie(c, 'refresh_token')

    if (!refreshToken) {
      throw new HTTPException(401, { message: 'Refresh token required.' })
    }

    const payload = await verify(refreshToken, env.JWT_SECRET!)

    if (payload.type !== 'refresh') {
      throw new HTTPException(401, { message: 'Invalid token type.' })
    }

    const tokenIsValid = await tokenService.verifyRefreshToken(payload.id as string, payload.jti as string)

    if (!tokenIsValid) {
      deleteCookie(c, 'access_token')
      deleteCookie(c, 'refresh_token')
      throw new HTTPException(401, { message: 'Invalid refresh token.' })
    }

    const user = await userService.findUserById(payload.id as string)

    if (!user) {
      throw new HTTPException(401, { message: 'User not found.' })
    }

    const newAccessJti = randomUUID()
    const newRefreshJti = randomUUID()

    const newAccessPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY,
      jti: newAccessJti,
      type: 'access',
    }

    const newRefreshPayload = {
      id: user.id,
      jti: newRefreshJti,
      exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRY,
      type: 'refresh',
    }

    const newAccessToken = await sign(newAccessPayload, env.JWT_SECRET!)
    const newRefreshToken = await sign(newRefreshPayload, env.JWT_SECRET!)

    await tokenService.storeRefreshToken({
      userId: user.id,
      tokenId: newRefreshJti,
      expiresAt: new Date(newRefreshPayload.exp * 1000),
      userAgent: c.req.header('User-Agent') || 'unknown',
      ip: c.req.header('X-Forwarded-For') || c.req.header('CF-Connecting-IP') || 'unknown',
    })

    await tokenService.invalidateRefreshToken(payload.jti as string)

    setCookie(c, 'access_token', newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: ACCESS_TOKEN_EXPIRY,
      path: '/',
    })

    setCookie(c, 'refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: REFRESH_TOKEN_EXPIRY,
      path: '/',
    })

    return c.json({
      message: 'Token refreshed successfully!',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    deleteCookie(c, 'access_token')
    deleteCookie(c, 'refresh_token')

    throw new HTTPException(401, { message: 'Invalid or expired token.' })
  }
})

authRoutes.post('/logout', async (c) => {
  try {
    const refreshToken = getCookie(c, 'refresh_token')

    if (refreshToken) {
      const payload = await verify(refreshToken, env.JWT_SECRET!)

      await tokenService.invalidateRefreshToken(payload.jti as string)
    }

    deleteCookie(c, 'access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/',
      maxAge: 0,
    })

    deleteCookie(c, 'refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/',
      maxAge: 0,
    })

    return c.json({ message: 'Logged out successfully!' })
  } catch (error) {
    return c.json({ message: 'Logout failed' }, 500)
  }
})

authRoutes.post('/logout-all', async (c) => {
  try {
    const refreshToken = getCookie(c, 'refresh_token')

    if (!refreshToken) {
      throw new HTTPException(401, { message: 'No refresh token found.' })
    }

    const payload = await verify(refreshToken, env.JWT_SECRET!)

    if (!payload) {
      throw new HTTPException(401, { message: 'Invalid refresh token.' })
    }

    await tokenService.invalidateAllUserTokens(payload.id as string)

    deleteCookie(c, 'access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/',
      maxAge: 0,
    })

    deleteCookie(c, 'refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/',
      maxAge: 0,
    })

    return c.json({ message: 'Logged out from all devices successfully!' })
  } catch (error) {
    console.error('Logout all error:', error)
    return c.json({ message: 'Logout failed' }, 500)
  }
})

export { authRoutes }
