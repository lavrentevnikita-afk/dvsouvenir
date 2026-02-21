import { Body, Controller, Get, Post, Put, Patch, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
// import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { Throttle, SkipThrottle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, VerifyResetTokenDto } from './dto'
import { UpdateProfileDto, ChangePasswordDto } from '../users/dto/update-profile.dto'
import { JwtAuthGuard } from './jwt-auth.guard'

// @ApiTags('auth')
@SkipThrottle() // Отключаем глобальный throttler для всего контроллера, используем @Throttle на критичных роутах
@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @Post('register')
  // @ApiOperation({ summary: 'Register a new user' })
  // @ApiResponse({ status: 201, description: 'User successfully registered' })
  // @ApiResponse({ status: 400, description: 'Invalid input' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  @Post('login')
  // @ApiOperation({ summary: 'Login user' })
  // @ApiResponse({ status: 200, description: 'Successfully logged in' })
  // @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Throttle({ default: { limit: 10000, ttl: 60000 } }) // Высокий лимит для /me (вызывается часто)
  @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @Get('me')
  // @ApiOperation({ summary: 'Get current user profile' })
  // @ApiResponse({ status: 200, description: 'User profile retrieved' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  me(@Req() req: any) {
    const user = req.user
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        address: user.address,
        createdAt: user.createdAt,
      },
    }
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute to prevent email spam
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Request password reset' })
  // @ApiResponse({ status: 200, description: 'Password reset email sent if user exists' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto)
  }

  @Post('verify-reset-token')
  @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Verify password reset token' })
  // @ApiResponse({ status: 200, description: 'Token validity status' })
  verifyResetToken(@Body() dto: VerifyResetTokenDto) {
    return this.authService.verifyResetToken(dto.token)
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Reset password with token' })
  // @ApiResponse({ status: 200, description: 'Password successfully reset' })
  // @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto)
  }
}
