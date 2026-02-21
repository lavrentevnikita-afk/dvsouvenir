import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CatalogController } from './catalog.controller'
import { AdminCatalogController } from './admin-catalog.controller'
import { CatalogService } from './catalog.service'
import { ObjectStorageService } from '../storage/object-storage.service'
import { Category } from './category.entity'
import { Product } from './product.entity'
import { ProductImage } from './product-image.entity'
import { ArticleSequence } from './article-sequence.entity'
import { BomItem } from './bom-item.entity'
import { Stock } from '../b2b/stock.entity'
import { Warehouse } from '../ops/warehouse.entity'
import { AuthModule } from '../auth/auth.module'
import { AuditLog } from '../admin-settings/audit-log.entity'
import { User } from '../users/user.entity'
import { City } from './city.entity'
import { StoreProfile } from '../b2b/store-profile.entity'
import { PricingService } from '../shared/pricing/pricing.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Product, ProductImage, ArticleSequence, BomItem, Stock, Warehouse, AuditLog, User, City]),
    TypeOrmModule.forFeature([StoreProfile]),
    AuthModule,
  ],
  controllers: [CatalogController, AdminCatalogController],
  providers: [CatalogService, ObjectStorageService, PricingService],
  exports: [CatalogService]
})
export class CatalogModule {}
