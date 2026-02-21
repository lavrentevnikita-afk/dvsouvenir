import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Stock } from '../b2b/stock.entity'
import { Product } from '../catalog/product.entity'
import { OpsModule } from '../ops/ops.module'
import { AdminWarehouseController } from './admin-warehouse.controller'
import { AdminWarehouseService } from './admin-warehouse.service'

@Module({
  imports: [TypeOrmModule.forFeature([Stock, Product]), OpsModule],
  controllers: [AdminWarehouseController],
  providers: [AdminWarehouseService],
})
export class AdminWarehouseModule {}
