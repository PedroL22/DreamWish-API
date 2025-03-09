import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'

import { env } from '~/env'

export async function authMiddleware(c: Context, next: Next) {
  try {
    const token = getCookie(c, 'access_token')

    if (!token) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    const payload = await verify(token, env.JWT_SECRET!)

    if (payload.type !== 'access') {
      return c.json({ message: 'Invalid token type' }, 401)
    }

    c.set('user', payload)

    await next()
  } catch (error) {
    return c.json({ message: 'Unauthorized' }, 401)
  }
}

// Optional: Role-based middleware
export function roleMiddleware(roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user')

    if (!user || !roles.includes(user.role)) {
      return c.json({ message: 'Forbidden' }, 403)
    }

    await next()
  }
}
