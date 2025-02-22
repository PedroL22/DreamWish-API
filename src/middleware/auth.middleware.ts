import type { Context, Next } from 'hono'

export async function authMiddleware(c: Context, next: Next) {
  const token = c.req.header('Authorization')?.split(' ')[1]

  if (!token) {
    return c.json({ mensagem: 'Authentication token not provided.' }, 401)
  }

  try {
    await next()
  } catch (error) {
    return c.json({ mensagem: 'Invalid authentication token.' }, 401)
  }
}
