import type { Context, Next } from 'hono'

export async function errorHandlerMiddleware(c: Context, next: Next) {
  try {
    await next()
  } catch (err: any) {
    console.error(err)

    return c.json({ message: '❌ Internal Server Error' }, 500)
  }
}
