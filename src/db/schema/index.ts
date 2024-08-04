import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id')
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  username: text('name').notNull().unique(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  password: text('password').notNull(),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
