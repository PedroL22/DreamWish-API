import type { User } from '~/models/user.model'

export const appConfig = {
  port: Bun.env.PORT || 3030,
  db: {
    users: [] as User[],
  },
}
