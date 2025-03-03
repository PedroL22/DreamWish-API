import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['client', 'admin'])

export const users = pgTable('users', {
  id: uuid().primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  bio: text('bio'),
  role: userRoleEnum('role').notNull().default('client'),
})
