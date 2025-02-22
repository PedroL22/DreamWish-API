import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { sign } from 'hono/jwt'
import { z } from 'zod'

const authRoutes = new Hono()

const users = [] as any[]

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nome: z.string().min(3),
})

authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, nome } = c.req.valid('json')

  if (users.find((user) => user.email === email)) {
    throw new HTTPException(400, { message: 'Email already registered.' })
  }

  const newUser = {
    id: users.length + 1,
    email,
    password,
    nome,
  }
  users.push(newUser)

  return c.json({ message: 'User registered successfully.' }, 201)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  const user = users.find((user) => user.email === email)

  if (!user || user.password !== password) {
    throw new HTTPException(401, { message: 'Invalid credentials.' })
  }

  const payload = {
    id: user.id,
    email: user.email,
    nome: user.nome,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
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
