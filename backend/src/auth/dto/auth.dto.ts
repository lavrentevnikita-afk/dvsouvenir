import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator'
// import { ApiProperty } from '@nestjs/swagger'

export class RegisterDto {
  // @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsNotEmpty({ message: 'Email не может быть пустым' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email!: string

  // @ApiProperty({ example: 'password123', description: 'User password (min 6 characters)', minLength: 6 })
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password!: string

  // @ApiProperty({ example: 'Иван Петров', description: 'User full name' })
  @IsNotEmpty({ message: 'Имя не может быть пустым' })
  @IsString()
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  name!: string

  // @ApiProperty({ example: '+79991234567', description: 'User phone number' })
  @IsNotEmpty({ message: 'Телефон не может быть пустым' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Некорректный формат телефона' })
  phone!: string
}

export class LoginDto {
  // @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsNotEmpty({ message: 'Email не может быть пустым' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email!: string

  // @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @IsString()
  password!: string
}
