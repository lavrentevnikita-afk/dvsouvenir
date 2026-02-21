import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductionController } from './production.controller'
import { ProductionService } from './production.service'
import { OpsModule } from '../ops/ops.module'
import { Order } from '../orders/order.entity'
import { AuditLog } from '../admin-settings/audit-log.entity'
import { Product } from '../catalog/product.entity'
import { StoreProfile } from '../b2b/store-profile.entity'
import { User } from '../users/user.entity'
import { Shipment } from '../ops/shipment.entity'

@Module({
  imports: [OpsModule, TypeOrmModule.forFeature([Order, AuditLog, Product, StoreProfile, User, Shipment])],
  controllers: [ProductionController],
  providers: [ProductionService],
})
export class ProductionModule {}
