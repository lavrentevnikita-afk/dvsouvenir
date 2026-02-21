import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from '../users/users.module'
import { AuthModule } from '../auth/auth.module'
import { B2bController } from './b2b.controller'
import { B2bService } from './b2b.service'
import { StoreProfile } from './store-profile.entity'
import { User } from '../users/user.entity'
import { B2bBootstrapService } from './b2b.bootstrap.service'
import { Product } from '../catalog/product.entity'
import { Stock } from './stock.entity'
import { StoreModerationLog } from './store-moderation-log.entity'
import { AuditLog } from '../admin-settings/audit-log.entity'
import { Order } from '../orders/order.entity'
import { AdminShopsController } from './admin-shops.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreProfile, StoreModerationLog, User, Product, Stock, Order]),
    // audit_logs
    TypeOrmModule.forFeature([AuditLog]),
    UsersModule,
    AuthModule,
  ],
  controllers: [B2bController, AdminShopsController],
  providers: [B2bService, B2bBootstrapService],
})
export class B2bModule {}
