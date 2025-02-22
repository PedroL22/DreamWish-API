import type { Context } from 'hono'

export class HomeController {
  async healthCheck(c: Context) {
    return c.text('Server is running!')
  }
}
