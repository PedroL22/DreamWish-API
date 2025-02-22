import type { Context, Next } from 'hono'
import { verify } from 'hono/jwt'

export async function authMiddleware(c: Context, next: Next) {
  try {
    const authorization = c.req.header('Authorization')

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    const token = authorization.split(' ')[1]
    const payload = await verify(token, Bun.env.JWT_SECRET!)

    c.set('user', payload)
    await next()
  } catch (error) {
    return c.json({ message: 'Unauthorized' }, 401)
  }
}
