import { Hono } from 'hono'

import { rootRouter } from '~/routes/api'

const apiRoutes = new Hono()

apiRoutes.route('/api', rootRouter)

export { apiRoutes }
