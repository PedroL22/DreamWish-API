import { z } from 'zod'

export const registerSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(3),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .regex(/[0-9]/, 'Password must contain at least one number.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(
        /[\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\\\|\,\.\?\/\`\'\~]/,
        'Password must contain at least one special character.'
      ),
    passwordConfirmation: z.string(),
  })
  .superRefine(({ passwordConfirmation, password }, ctx) => {
    if (passwordConfirmation !== password) {
      ctx.addIssue({
        code: 'custom',
        path: ['passwordConfirmation'],
        message: 'Passwords do not match.',
      })
    }
  })

export type Register = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export type Login = z.infer<typeof loginSchema>
