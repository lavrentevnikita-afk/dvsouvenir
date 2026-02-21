import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator'

export class RegisterStoreDto {
  @IsNotEmpty()
  @IsString()
  name!: string

  @IsEmail()
  email!: string

  @MinLength(6)
  password!: string

  @IsNotEmpty()
  @IsString()
  companyName!: string

  @IsOptional()
  @IsString()
  displayName?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  @Matches(/^\+7\d{10}$/, {
    message: 'Телефон должен быть в формате +7XXXXXXXXXX',
  })
  phone?: string

  // остальные поля — опциональные, оставляем без жёсткой валидации (не ломаем текущие формы)
  @IsOptional()
  inn?: string

  @IsOptional()
  kpp?: string

  @IsOptional()
  ogrn?: string

  @IsOptional()
  contacts?: Record<string, any>

  @IsOptional()
  logoUrl?: string

  @IsOptional()
  website?: string
}

export class UpdateStoreProfileDto {
  @IsOptional()
  @IsString()
  companyName?: string

  @IsOptional()
  @IsString()
  displayName?: string

  @IsOptional()
  logoUrl?: string | null

  @IsOptional()
  address?: string | null

  @IsOptional()
  city?: string | null

  @IsOptional()
  @IsString()
  @Matches(/^\+7\d{10}$/, {
    message: 'Телефон должен быть в формате +7XXXXXXXXXX',
  })
  phone?: string | null

  @IsOptional()
  website?: string | null

  @IsOptional()
  inn?: string | null

  @IsOptional()
  kpp?: string | null

  @IsOptional()
  ogrn?: string | null

  @IsOptional()
  contacts?: Record<string, any> | null

  @IsOptional()
  priceGroupId?: number | null
}
