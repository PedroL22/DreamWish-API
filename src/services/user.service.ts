import argon2 from 'argon2'
import { randomUUID } from 'node:crypto'

import { db } from '~/database'
import { users } from '~/database/schema'

import { type InferSelectModel, eq } from 'drizzle-orm'
import type { Register } from '~/models/user.model'

type User = InferSelectModel<typeof users>

export class UserService {
  async listUsers(): Promise<User[]> {
    return await db.select().from(users)
  }

  async verifyPassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, inputPassword)
    } catch (error) {
      return false
    }
  }

  async findUserByEmail(email: string): Promise<Omit<User, 'updatedAt' | 'bio'> | undefined> {
    try {
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          password: users.password,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)

      return user
    } catch {
      return undefined
    }
  }

  async createUser(userData: Register): Promise<Omit<User, 'password' | 'updatedAt' | 'bio'>> {
    const hashedPassword = await argon2.hash(userData.password)

    const newUser: Omit<User, 'updatedAt' | 'bio'> = {
      id: randomUUID(),
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
    }

    await db.insert(users).values(newUser).execute()
    const { password, ...userWithoutPassword } = newUser
    return userWithoutPassword
  }
}
