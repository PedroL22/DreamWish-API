import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { z } from 'zod'

import { UsersService } from '~/modules/users/users.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async signIn(params: { credential: string; password: string }) {
    const { credential, password } = params

    try {
      let user = null

      if (z.string().email().parse(credential)) {
        user = await this.usersService.findUserByEmail(credential)
      } else {
        user = await this.usersService.findUserByUsername(credential)
      }

      if (user instanceof NotFoundException) {
        throw user
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials.')
      }

      const payload = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      }

      return {
        access_token: await this.jwtService.signAsync(payload),
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid credentials.')
      }

      throw new UnauthorizedException('An error occurred during sign in.')
    }
  }

  async register(params: { email: string; username: string; password: string; passwordConfirmation: string }) {
    const { email, username, password, passwordConfirmation } = params

    try {
      z.string().email().parse(email)
    } catch (err) {
      throw new BadRequestException('Invalid e-mail format')
    }

    if (password !== passwordConfirmation) {
      throw new BadRequestException('Passwords do not match.')
    }

    try {
      const checkEmail = await this.usersService.findUserByEmail(email)
      if (checkEmail) {
        throw new ConflictException('E-mail already taken.')
      }

      const checkUsername = await this.usersService.findUserByUsername(username)
      if (checkUsername) {
        throw new ConflictException('Username already taken.')
      }

      const hashedPassword = await this.hashPassword(password)
      const createdUser = await this.usersService.createUser({ email, username, password: hashedPassword })

      if (!createdUser) {
        throw new BadRequestException('User creation failed.')
      }

      if (!(createdUser instanceof ConflictException) && !(createdUser instanceof BadRequestException)) {
        return { id: createdUser.id, username: createdUser.username }
      }
    } catch (error) {
      throw new BadRequestException('An error occurred during registration.')
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }
}
