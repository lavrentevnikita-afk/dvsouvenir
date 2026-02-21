import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Product } from '../catalog/product.entity'
import { Stock } from '../b2b/stock.entity'
import { StoreProfile } from '../b2b/store-profile.entity'
import { CartController } from './cart.controller'
import { CartService } from './cart.service'
import { PricingService } from '../shared/pricing/pricing.service'

@Module({
  imports: [TypeOrmModule.forFeature([Product, Stock, StoreProfile])],
  controllers: [CartController],
  providers: [CartService, PricingService],
})
export class CartModule {}
