import { Hono } from 'hono'

import { appConfig } from '~/config/config'
import { errorHandlerMiddleware } from '~/middleware/error-handler.middleware'
import apiRoutes from '~/routes/api.routes'
import authRoutes from '~/routes/auth.routes'

const app = new Hono()

app.use(errorHandlerMiddleware)

app.route('/api', apiRoutes)
app.route('/auth', authRoutes)

app.get('/', (c) => {
  return c.text('Backend MVC with Bun and Hono is running!')
})

Bun.serve({
  port: appConfig.port,
  fetch: app.fetch,
})

console.log(`Server running at http://localhost:${appConfig.port}`)
