import { Module } from '@nestjs/common'
import { AdminDbController } from './admin-db.controller'

@Module({
  controllers: [AdminDbController],
})
export class AdminDbModule {}
