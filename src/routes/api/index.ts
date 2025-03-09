import { Hono } from 'hono'

import { authRoutes } from '~/routes/api/auth.routes'
import { usersRoutes } from '~/routes/api/users.routes'
import { wishlistsRouter } from '~/routes/api/wishlists.routes'

const rootRouter = new Hono()

rootRouter.route('/auth', authRoutes)

rootRouter.route('/users', usersRoutes)
rootRouter.route('/wishlists', wishlistsRouter)

export { rootRouter }
