import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Product } from '../catalog/product.entity'
import { Stock } from '../b2b/stock.entity'
import { StockMovement } from '../ops/stock-movement.entity'
import { Warehouse } from '../ops/warehouse.entity'
import { InventoryLine } from '../ops/inventory-line.entity'
import { InventorySession } from '../ops/inventory-session.entity'
import { User } from '../users/user.entity'
import { AdminInventoryController } from './admin-inventory.controller'
import { AdminInventoryService } from './admin-inventory.service'

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, Stock, StockMovement, Product, InventorySession, InventoryLine, User])],
  controllers: [AdminInventoryController],
  providers: [AdminInventoryService],
})
export class AdminInventoryModule {}
