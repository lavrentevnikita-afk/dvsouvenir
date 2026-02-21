import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export * from './dto/get-orders-filter.dto'

export class CreateOrderItemDto {
  @IsInt()
  @Type(() => Number)
  productId!: number

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number
}

export class CreateOrderDto {
  @IsString()
  @MinLength(2)
  customerName!: string  // <-- ИМЯ КЛИЕНТА ТУТ

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  @Matches(/^\+7\d{10}$/, {
    message: 'Телефон должен быть в формате +7XXXXXXXXXX',
  })
  phone?: string

  @IsOptional()
  @IsString()
  comment?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[]
}
