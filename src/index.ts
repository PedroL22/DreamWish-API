import { Hono } from 'hono'

import { appConfig } from '~/config/config'
import { errorHandlerMiddleware } from '~/middleware/error-handler.middleware'
import { rateLimitMiddleware } from '~/middleware/rate-limit.middleware'
import { apiRoutes } from '~/routes'

const app = new Hono()

app.use(errorHandlerMiddleware)
app.use(rateLimitMiddleware)

app.route('/', apiRoutes)

Bun.serve({
  port: appConfig.port,
  fetch: app.fetch,
})

console.log(`✨ Server running at ${appConfig.currentURL}`)
