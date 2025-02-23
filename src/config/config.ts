import { env } from '~/env'

export const appConfig = {
  port: env.PORT || 3030,
  currentURL: env.RENDER_EXTERNAL_URL || `http://localhost:${env.PORT}`,
}
