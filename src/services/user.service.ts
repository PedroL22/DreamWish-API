import argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

import { db } from '~/database'
import { users } from '~/database/schema'

import type { Register, User } from '~/models/user.model'

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

  async findUserByCredential(credential: string): Promise<Omit<User, 'updatedAt' | 'bio'> | undefined> {
    try {
      const isEmail = z.string().email().safeParse(credential).success
      const condition = isEmail ? eq(users.email, credential) : eq(users.username, credential)

      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          password: users.password,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(condition)
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
