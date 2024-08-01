import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '~/db/connection'
import { users } from '~/db/schema/users'

type UserModel = typeof users.$inferSelect

@Injectable()
export class UsersService {
  async findUserById(id: string): Promise<Partial<UserModel> | NotFoundException> {
    const user = await db.select().from(users).where(eq(users.id, id))

    if (!user) {
      return new NotFoundException('User not found.')
    }

    return user[0]
  }

  async findUserByUsername(username: string): Promise<Partial<UserModel> | NotFoundException> {
    const user = await db.select().from(users).where(eq(users.username, username))

    if (!user) {
      return new NotFoundException('User not found.')
    }

    return user[0]
  }

  async findUserByEmail(email: string): Promise<Partial<UserModel> | NotFoundException> {
    try {
      z.string().email().parse(email)
    } catch (err) {
      throw new BadRequestException('Invalid e-mail format')
    }

    const user = await db.select().from(users).where(eq(users.email, email))

    if (!user) {
      return new NotFoundException('User not found.')
    }

    return user[0]
  }

  async findAllUsers(): Promise<Partial<UserModel>[]> {
    return db.select().from(users)
  }

  async editUserById(id: string, data: Partial<UserModel>): Promise<Partial<UserModel> | NotFoundException> {
    const user = await db.select().from(users).where(eq(users.id, id))

    if (!user) {
      return new NotFoundException('User not found.')
    }

    await db
      .update(users)
      .set({ ...data })
      .where(eq(users.id, id))
  }

  async deleteUserById(id: string): Promise<NotFoundException> {
    const user = await db.select().from(users).where(eq(users.id, id))

    if (!user) {
      return new NotFoundException('User not found.')
    }

    await db.delete(users).where(eq(users.id, id))
  }

  async createUser(data: Partial<UserModel>): Promise<Partial<UserModel> | ConflictException | BadRequestException> {
    try {
      z.object({
        email: z.string({ required_error: 'E-mail is required.' }).email('Invalid e-mail format.'),
        username: z.string({ required_error: 'Username is required.' }),
        phone: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        password: z.string({ required_error: 'Password is required.' }),
        isAdmin: z.boolean().optional(),
      }).parse(data)
    } catch (err) {
      throw new BadRequestException(err)
    }

    const checkEmail = await db.select().from(users).where(eq(users.email, data.email))
    if (checkEmail.length) {
      return new ConflictException('User already exists.')
    }

    const checkUsername = await db.select().from(users).where(eq(users.username, data.username))
    if (checkUsername.length) {
      return new ConflictException('Username already taken.')
    }

    if (!data.username) {
      return new BadRequestException('Username is required.')
    }

    const user: UserModel = {
      id: crypto.randomUUID(),
      username: data.username,
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      isAdmin: data.isAdmin,
      createdAt: new Date(),
      updatedAt: null,
    }

    await db.insert(users).values(user)
  }
}
