import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreatePromoBannerDto {
  @IsString()
  @MaxLength(200)
  title!: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  type?: string

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  text?: string

  @IsString()
  @MaxLength(500)
  imageUrl!: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkUrl?: string

  @IsOptional()
  @IsInt()
  sortOrder?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  // Optional schedule window (ISO string). Inclusive.
  @IsOptional()
  @IsDateString()
  startAt?: string

  @IsOptional()
  @IsDateString()
  endAt?: string
}

export class UpdatePromoBannerDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  type?: string

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  text?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkUrl?: string

  @IsOptional()
  @IsInt()
  sortOrder?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsDateString()
  startAt?: string

  @IsOptional()
  @IsDateString()
  endAt?: string
}
