import { IsEnum, IsOptional, IsString } from 'class-validator'
import { OrderStatus } from './get-orders-filter.dto'

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus

  @IsOptional()
  @IsString()
  note?: string // примечание менеджера при изменении статуса
}
