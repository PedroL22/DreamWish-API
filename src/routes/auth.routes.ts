import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { sign } from 'hono/jwt'

import { rateLimitMiddleware } from '~/middleware/rate-limit.middleware'
import { HomeController } from '~/controllers/home.controller'
import { loginSchema, registerSchema } from '~/models/user.model'
import { UserService } from '~/services/user.service'

const authRoutes = new Hono()

authRoutes.use(rateLimitMiddleware)

const homeController = new HomeController()
const userService = new UserService()

authRoutes.get('/', homeController.healthCheck.bind(homeController))

authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, username, password, passwordConfirmation } = c.req.valid('json')

  try {
    await userService.createUser({ email, username, password, passwordConfirmation })

    return c.json({ message: 'User registered successfully.' }, 201)
  } catch (error) {
    throw new HTTPException(500, { message: 'Failed to register user.' })
  }
})

authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  const user = await userService.findUserByEmail(email)
  if (!user) {
    throw new HTTPException(401, { message: 'Invalid credentials.' })
  }

  if (!(await userService.verifyPassword(password, user.password))) {
    throw new HTTPException(401, { message: 'Invalid credentials.' })
  }

  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
  }

  const token = await sign(payload, Bun.env.JWT_SECRET!)

  setCookie(c, 'token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
  })

  return c.json({ payload, token })
})

export default authRoutes
