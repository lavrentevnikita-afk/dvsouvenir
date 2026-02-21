import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength, Matches } from 'class-validator'

export class RegisterStoreDto {
  @IsNotEmpty({ message: 'Email не может быть пустым' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email!: string

  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password!: string

  @IsNotEmpty({ message: 'Название магазина не может быть пустым' })
  @IsString()
  @MinLength(2, { message: 'Название должно содержать минимум 2 символа' })
  storeName!: string

  @IsNotEmpty({ message: 'Имя контактного лица не может быть пустым' })
  @IsString()
  contactName!: string

  @IsNotEmpty({ message: 'Телефон не может быть пустым' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Некорректный формат телефона' })
  phone!: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  inn?: string
}
