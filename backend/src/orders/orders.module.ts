import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Order } from './order.entity'
import { OrdersService } from './orders.service'
import { OrdersController } from './orders.controller'
import { ManagerOrdersController } from './manager-orders.controller'
import { AuthModule } from '../auth/auth.module'
// ...existing code...
import { Product } from '../catalog/product.entity' // 👈 добавили
import { StoreProfile } from '../b2b/store-profile.entity'
import { Stock } from '../b2b/stock.entity'
import { PricingService } from '../shared/pricing/pricing.service'
import { PdfService } from '../shared/pdf.service'

@Module({
  imports: [
    // OrdersService uses repositories for Order, Product and StoreProfile
    TypeOrmModule.forFeature([Order, Product, StoreProfile, Stock]),
    AuthModule,
  // ...existing code...
  ],
  controllers: [OrdersController, ManagerOrdersController],
  providers: [OrdersService, PricingService, PdfService],
})
export class OrdersModule {}
