import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './user.entity'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { UsersBootstrapService } from './users.bootstrap.service'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersBootstrapService, // ✅ важно: иначе onModuleInit не запустится
  ],
  exports: [UsersService],
})
export class UsersModule {}
