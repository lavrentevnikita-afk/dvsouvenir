import { Module, forwardRef } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersModule } from '../users/users.module'
// ...existing code...
import { PasswordReset } from './entities/password-reset.entity'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtStrategy } from './jwt.strategy'
import { RolesGuard } from './roles.guard'

@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordReset]),
    forwardRef(() => UsersModule), // <--- важно
  // ...existing code...
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'dev_jwt_secret_change_me',
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') || '7d' },
      }),
    }),
  ],
  providers: [AuthService, JwtAuthGuard, JwtStrategy, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
