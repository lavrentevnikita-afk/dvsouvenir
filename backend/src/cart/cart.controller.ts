import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard'
import { CartPreviewDto } from './dto'
import { CartService } from './cart.service'

@Controller('/api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Cart preview: enriches client-side cart with:
   * - availability (canOrder/status)
   * - price breakdown (retail/discount/final)
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Post('preview')
  preview(@Body() dto: CartPreviewDto, @Req() req: any) {
    return this.cartService.preview(dto, req?.user ?? null)
  }
}
