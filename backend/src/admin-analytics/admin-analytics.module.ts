import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Category } from '../catalog/category.entity'
import { Product } from '../catalog/product.entity'
import { StoreProfile } from '../b2b/store-profile.entity'
import { Stock } from '../b2b/stock.entity'
import { PromoBanner } from '../content/promo-banner.entity'
import { Order } from '../orders/order.entity'
import { User } from '../users/user.entity'
import { AdminAnalyticsController } from './admin-analytics.controller'
import { AdminAnalyticsService } from './admin-analytics.service'

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, Category, StoreProfile, Stock, PromoBanner, User])],
  controllers: [AdminAnalyticsController],
  providers: [AdminAnalyticsService],
})
export class AdminAnalyticsModule {}
