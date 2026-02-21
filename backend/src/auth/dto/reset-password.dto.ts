import { IsString, MinLength, Matches } from 'class-validator'

export class ResetPasswordDto {
  @IsString()
  token!: string

  @IsString()
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Пароль должен содержать заглавные и строчные буквы, а также цифры',
  })
  newPassword!: string
}
