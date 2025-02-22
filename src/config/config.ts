export const appConfig = {
  port: Bun.env.PORT || 3030,
  currentURL: Bun.env.RENDER_EXTERNAL_URL || `http://localhost:${Bun.env.PORT}`,
}
