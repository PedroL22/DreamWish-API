import { Hono } from 'hono'

import { authRoutes } from '~/routes/api/auth.routes'
import { usersRoutes } from '~/routes/api/users.routes'

const rootRouter = new Hono()

rootRouter.route('/auth', authRoutes)
rootRouter.route('/users', usersRoutes)

export { rootRouter }
