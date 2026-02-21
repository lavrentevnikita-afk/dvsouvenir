import { IsInt, IsPositive } from 'class-validator'

export class AddToWishlistDto {
  @IsInt()
  @IsPositive()
  productId!: number
}
