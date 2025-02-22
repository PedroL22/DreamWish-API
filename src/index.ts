import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import { getCookie, setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { sign } from 'hono/jwt'
import { logger } from 'hono/logger'
import { z } from 'zod'

const app = new Hono()

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
})

app.use(logger())

app.post('/login', zValidator('json', schema), async (c) => {
  const { email, password } = await c.req.json()

  if (password !== 'testing') {
    throw new HTTPException(401, { message: 'Invalid credentials.' })
  }

  const payload = {
    email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
  }

  const token = await sign(payload, Bun.env.JWT_SECRET || '')

  setCookie(c, 'token', token)

  return c.json({ payload, token })
})

app.use(
  '/index/*',
  bearerAuth({
    verifyToken: async (token, c) => {
      return token === getCookie(c, 'token')
    },
  })
)

app.get('/index/movies', (c) => {
  return c.json({
    movies: [
      { title: 'The Godfather', year: 1972 },
      { title: 'The Godfather: Part II', year: 1974 },
      { title: 'The Dark Knight', year: 2008 },
      { title: '12 Angry', year: 1957 },
    ],
  })
})

export default app
