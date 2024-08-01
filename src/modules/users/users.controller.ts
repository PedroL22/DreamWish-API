import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'

import type { users } from '~/db/schema/users'
import { AuthGuard } from '~/middleware/auth.guard'
import type { UsersService } from './users.service'

type UserModel = typeof users.$inferSelect

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('users')
  async getUsers(): Promise<{ data: Partial<UserModel>[] }> {
    const users = await this.usersService.findAllUsers()

    return {
      data: users,
    }
  }

  @UseGuards(AuthGuard)
  @Get('users/:id')
  async getUserById(@Param('id') id: string): Promise<{ data: Partial<UserModel> } | string | object> {
    const result = await this.usersService.findUserById(id)

    if (result instanceof NotFoundException) return result.getResponse()

    return {
      data: result,
    }
  }

  @UseGuards(AuthGuard)
  @Get('users/:email')
  async getUserByEmail(@Param('email') email: string): Promise<{ data: Partial<UserModel> } | string | object> {
    const result = await this.usersService.findUserByEmail(email)

    if (result instanceof NotFoundException) return result.getResponse()

    return {
      data: result,
    }
  }

  @UseGuards(AuthGuard)
  @Get('users/:username')
  async getUserByUsername(
    @Param('username') username: string
  ): Promise<{ data: Partial<UserModel> } | string | object> {
    const result = await this.usersService.findUserByUsername(username)

    if (result instanceof NotFoundException) return result.getResponse()

    return {
      data: result,
    }
  }

  @UseGuards(AuthGuard)
  @Put('users/:id')
  async putUser(
    @Request() req,
    @Param('id') id: string,
    @Body()
    data: {
      username: string
    }
  ): Promise<{ data: Partial<UserModel> } | NotFoundException | UnauthorizedException> {
    const isAdmin = req.user.isAdmin
    const isOwner = req.user.id === id

    const hasPermission = isAdmin || isOwner

    if (!hasPermission) {
      throw new UnauthorizedException('You do not have permission to edit this user.')
    }

    const result = await this.usersService.editUserById(id, data)

    if (result instanceof NotFoundException) return result

    return {
      message: 'User edited successfully.',
      data: result,
    }
  }

  @UseGuards(AuthGuard)
  @Delete('users/:id')
  async deleteUser(
    @Request() req,
    @Param('id') id: string
  ): Promise<{ data } | NotFoundException | UnauthorizedException> {
    const isAdmin = req.user.isAdmin
    const isOwner = req.user.id === id

    const hasPermission = isAdmin || isOwner

    if (!hasPermission) {
      throw new UnauthorizedException('You do not have permission to delete this user.')
    }

    const result = await this.usersService.deleteUserById(id)

    if (result instanceof NotFoundException) return result

    return {
      message: 'User deleted successfully.',
      data: result,
    }
  }
}
