import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'

import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signInUser(@Body() signInData: { credential: string; password: string }): Promise<{
    message: string
    data: { access_token: string }
  }> {
    const result = await this.authService.signIn(signInData)

    return {
      message: 'You have been authenticated successfully.',
      data: result,
    }
  }

  @Post('register')
  async registerUser(
    @Body()
    registerData: {
      email: string
      username: string
      password: string
      passwordConfirmation: string
    }
  ): Promise<{
    message: string
    data: {
      id: string
      username: string
    }
  }> {
    const result = await this.authService.register(registerData)

    return {
      message: 'User created successfully.',
      data: result,
    }
  }
}
