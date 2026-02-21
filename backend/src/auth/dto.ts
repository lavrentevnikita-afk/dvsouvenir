import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export * from './dto/forgot-password.dto'
export * from './dto/reset-password.dto'
export * from './dto/verify-reset-token.dto'

export class RegisterDto {
  @IsNotEmpty()
  name!: string

  @IsEmail()
  email!: string

  @MinLength(6)
  password!: string
}

export class LoginDto {
  @IsEmail()
  email!: string

  @IsNotEmpty()
  password!: string
}
