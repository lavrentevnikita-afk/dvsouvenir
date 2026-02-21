import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../users/user.entity'
import { Warehouse } from '../ops/warehouse.entity'
import { AdminSettingsController } from './admin-settings.controller'
import { AdminSettingsService } from './admin-settings.service'
import { AuditLog } from './audit-log.entity'
import { SettingsKv } from './settings-kv.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, Warehouse, SettingsKv, AuditLog])],
  controllers: [AdminSettingsController],
  providers: [AdminSettingsService],
})
export class AdminSettingsModule {}
