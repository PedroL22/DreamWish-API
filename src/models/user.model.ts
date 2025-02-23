import type { InferSelectModel } from 'drizzle-orm'
import type { z } from 'zod'

import type { users } from '~/database/schema'

import type { loginDTO } from '~/dtos/users/login.dto'
import type { registerDTO } from '~/dtos/users/register.dto'

export type User = InferSelectModel<typeof users>

export type Register = z.infer<typeof registerDTO>
export type Login = z.infer<typeof loginDTO>
