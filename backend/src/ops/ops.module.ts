import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Order } from '../orders/order.entity'
import { Stock } from '../b2b/stock.entity'
import { Product } from '../catalog/product.entity'
import { OpsController } from './ops.controller'
import { OpsService } from './ops.service'
import { Warehouse } from './warehouse.entity'
import { StockMovement } from './stock-movement.entity'
import { ProductionTask } from './production-task.entity'
import { OrderComment } from './order-comment.entity'
import { Shipment } from './shipment.entity'
import { User } from '../users/user.entity'
import { InventorySession } from './inventory-session.entity'
import { InventoryItem } from './inventory-item.entity'
import { SystemEvent } from './system-event.entity'
import { SettingsKv } from '../admin-settings/settings-kv.entity'
import { InventoryReservation } from './inventory-reservation.entity'
import { BomItem } from '../catalog/bom-item.entity'
import { WorkOrder } from './work-order.entity'
import { ProductionAdminController } from './production-admin.controller'
import { OpsBootstrapService } from './ops.bootstrap.service'
import { City } from '../catalog/city.entity'
import { StoreProfile } from '../b2b/store-profile.entity'
import { AuditLog } from '../admin-settings/audit-log.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Stock,
      Product,
      Warehouse,
      StockMovement,
      ProductionTask,
      OrderComment,
      Shipment,
      User,
      InventorySession,
      InventoryItem,
      SystemEvent,
      SettingsKv,
      InventoryReservation,
      BomItem,
      WorkOrder,
      City,
      StoreProfile,
      AuditLog,
    ]),
  ],
  controllers: [OpsController, ProductionAdminController],
  providers: [OpsService, OpsBootstrapService],
  exports: [OpsService],
})
export class OpsModule {}
