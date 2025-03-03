import { z } from 'zod'

export const loginDTO = z.object({
  credential: z.string(),
  password: z.string(),
})
