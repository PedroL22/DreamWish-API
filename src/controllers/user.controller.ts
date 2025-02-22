import type { Context } from 'hono'

import type { UserService } from '~/services/user.service'

export class UserController {
  constructor(private userService: UserService) {}

  async listUsers(c: Context): Promise<Response> {
    const users = await this.userService.listUsers()

    return c.json(users)
  }

  async createUser(c: Context): Promise<Response> {
    const userData = await c.req.json()
    const newUser = await this.userService.createUser(userData)

    return c.json(newUser, 201)
  }
}
