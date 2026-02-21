import { IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator'

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(40)
  @Matches(/^\+7\d{10}$/, {
    message: 'Телефон должен быть в формате +7XXXXXXXXXX',
  })
  phone?: string

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string
}
