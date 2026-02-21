import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, ParseIntPipe, Query } from '@nestjs/common'
import { WishlistService } from './wishlist.service'
import { AddToWishlistDto } from './dto/add-to-wishlist.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('/api/wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getWishlist(@Request() req: any) {
    const userId = req.user?.userId
    const items = await this.wishlistService.getAll(userId)
    return { items }
  }

  @Post()
  async addToWishlist(@Request() req: any, @Body() dto: AddToWishlistDto) {
    const userId = req.user?.userId
    return this.wishlistService.add(userId, dto.productId)
  }

  @Delete(':productId')
  async removeFromWishlist(
    @Request() req: any,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const userId = req.user?.userId
    return this.wishlistService.remove(userId, productId)
  }

  @Get('check/:productId')
  async checkProduct(
    @Request() req: any,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const userId = req.user?.userId
    const inWishlist = await this.wishlistService.check(userId, productId)
    return { inWishlist }
  }

  @Post('check-multiple')
  async checkMultiple(@Request() req: any, @Body() body: { productIds: number[] }) {
    const userId = req.user?.userId
    const result = await this.wishlistService.checkMultiple(userId, body.productIds || [])
    return { wishlist: result }
  }
}
