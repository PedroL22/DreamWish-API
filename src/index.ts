import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
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

export default app
