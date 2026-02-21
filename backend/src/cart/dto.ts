import { IsArray, IsInt, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class CartPreviewItemDto {
  @IsInt()
  productId!: number

  @IsInt()
  @Min(1)
  quantity!: number
}

export class CartPreviewDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartPreviewItemDto)
  items!: CartPreviewItemDto[]
}
