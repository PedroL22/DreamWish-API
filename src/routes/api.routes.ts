import { Hono } from 'hono'

import { UserController } from '~/controllers/user.controller'
import { authMiddleware } from '~/middleware/auth.middleware'
import { UserService } from '~/services/user.service'

const apiRoutes = new Hono()

const userService = new UserService()
const userController = new UserController(userService)

apiRoutes.use(authMiddleware)

apiRoutes.get('/users', userController.listUsers.bind(userController))
apiRoutes.post('/users', userController.createUser.bind(userController))

export default apiRoutes
