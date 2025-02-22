import type { Context } from 'hono'

export class HomeController {
  async index(c: Context) {
    return c.text('Welcome to the Backend MVC with Bun and Hono!')
  }
}
