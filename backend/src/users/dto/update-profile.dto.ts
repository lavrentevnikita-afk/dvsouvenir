import { IsEmail, IsOptional, IsString, MinLength, Matches } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsEmail({}, { message: 'Некорректный формат email' })
  email?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  address?: string
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  currentPassword!: string

  @IsString()
  @MinLength(8, { message: 'Новый пароль должен содержать минимум 8 символов' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Пароль должен содержать заглавные и строчные буквы, а также цифры'
  })
  newPassword!: string
}
