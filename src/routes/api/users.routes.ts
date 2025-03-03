import { Hono } from 'hono'

import { UserController } from '~/controllers/user.controller'
import { authMiddleware } from '~/middleware/auth.middleware'
import { UserService } from '~/services/user.service'

const usersRoutes = new Hono()

const userService = new UserService()
const userController = new UserController(userService)

usersRoutes.use(authMiddleware)

usersRoutes.get('/users', userController.listUsers.bind(userController))
usersRoutes.post('/users', userController.createUser.bind(userController))

export { usersRoutes }
