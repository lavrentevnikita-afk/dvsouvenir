import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ContentService } from './content.service'
import { PromoBanner } from './promo-banner.entity'
import { ContentController } from './content.controller'
import { AdminContentController } from './admin-content.controller'

@Module({
  imports: [TypeOrmModule.forFeature([PromoBanner])],
  controllers: [ContentController, AdminContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
