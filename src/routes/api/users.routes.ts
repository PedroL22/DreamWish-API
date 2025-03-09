import { Hono } from 'hono'

import { UserController } from '~/controllers/user.controller'
import { authMiddleware } from '~/middleware/auth.middleware'
import { UserService } from '~/services/user.service'

const usersRoutes = new Hono()

usersRoutes.use(authMiddleware)

const userService = new UserService()
const userController = new UserController(userService)

usersRoutes.get('/', userController.listUsers.bind(userController))
usersRoutes.post('/', userController.createUser.bind(userController))

export { usersRoutes }
