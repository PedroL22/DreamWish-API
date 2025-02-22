import { Hono } from 'hono'

import { appConfig } from '~/config/config'
import { errorHandlerMiddleware } from '~/middleware/error-handler.middleware'
import { rateLimitMiddleware } from '~/middleware/rate-limit.middleware'
import apiRoutes from '~/routes/api.routes'
import authRoutes from '~/routes/auth.routes'

const app = new Hono()

app.use(errorHandlerMiddleware)
app.use(rateLimitMiddleware)

app.route('/auth', authRoutes)
app.route('/api', apiRoutes)

Bun.serve({
  port: appConfig.port,
  fetch: app.fetch,
})

console.log(`✨ Server running at http://localhost:${appConfig.port}`)
