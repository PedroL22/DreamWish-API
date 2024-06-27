import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
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
    const checkIfUserExists = await db.select().from(users).where(eq(users.email, data.email))

    if (checkIfUserExists.length) {
      return new ConflictException('User already exists.')
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
      createdAt: new Date(),
      updatedAt: null,
    }

    await db.insert(users).values(user)
  }
}
