import type { User } from '../models/user.model'

const db = {
  users: [] as User[],
}

export class UserService {
  async listUsers(): Promise<User[]> {
    return db.users
  }

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      id: db.users.length + 1,
      ...userData,
    }
    db.users.push(newUser)
    return newUser
  }
}
