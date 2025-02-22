import { z } from 'zod'

export const UserSchema = z.object({
  id: z.number().int().positive(),
  nome: z.string().min(3).max(100),
  email: z.string().email(),
})

export type User = z.infer<typeof UserSchema>
