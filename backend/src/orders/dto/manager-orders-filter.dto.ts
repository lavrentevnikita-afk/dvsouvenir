import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'
import { OrderStatus } from './get-orders-filter.dto'

export class ManagerOrdersFilterDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

  @IsOptional()
  @IsString()
  customerName?: string

  @IsOptional()
  @IsString()
  customerEmail?: string

  @IsOptional()
  @IsString()
  customerPhone?: string

  @IsOptional()
  @IsDateString()
  dateFrom?: string

  @IsOptional()
  @IsDateString()
  dateTo?: string

  @IsOptional()
  @IsString()
  search?: string // поиск по номеру заказа, имени клиента, email

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20
}
