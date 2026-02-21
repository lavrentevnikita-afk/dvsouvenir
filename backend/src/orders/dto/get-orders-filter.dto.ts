import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator'
import { Type } from 'class-transformer'

export enum OrderStatus {
  NEW = 'new',
  PROCESSING = 'processing',
  READY = 'ready',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class GetOrdersFilterDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

  @IsOptional()
  @IsDateString()
  dateFrom?: string

  @IsOptional()
  @IsDateString()
  dateTo?: string

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10
}
