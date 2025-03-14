import { Hono } from 'hono'
import { logger } from 'hono/logger'

import { appConfig } from '~/config/config'
import { scheduleCleanupExpiredTokensJob } from '~/database/jobs/scheduleCleanupExpiredTokensJob '
import { errorHandlerMiddleware } from '~/middleware/error-handler.middleware'
import { rateLimitMiddleware } from '~/middleware/rate-limit.middleware'
import { apiRoutes } from '~/routes'

const app = new Hono()

app.use(logger())
app.use(errorHandlerMiddleware)
app.use(rateLimitMiddleware)

app.route('/', apiRoutes)

scheduleCleanupExpiredTokensJob()

Bun.serve({
  port: appConfig.port,
  fetch: app.fetch,
})

console.log(`✨ Server running at ${appConfig.currentURL}`)
