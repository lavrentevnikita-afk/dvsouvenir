import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
// import { CacheModule } from '@nestjs/cache-manager'
import { APP_GUARD } from '@nestjs/core'
// import * as redisStore from 'cache-manager-redis-store'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CatalogModule } from './catalog/catalog.module'
import { OrdersModule } from './orders/orders.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { B2bModule } from './b2b/b2b.module'
import { OpsModule } from './ops/ops.module'
import { AdminDbModule } from './admin-db/admin-db.module'
import { MediaModule } from './media/media.module'
import { ContentModule } from './content/content.module'
import { AdminAnalyticsModule } from './admin-analytics/admin-analytics.module'
import { AdminSettingsModule } from './admin-settings/admin-settings.module'
import { AdminWarehouseModule } from './admin-warehouse/admin-warehouse.module'
import { AdminInventoryModule } from './admin-inventory/admin-inventory.module'
import { ProductionModule } from './production/production.module'
import { CartModule } from './cart/cart.module'
import { HealthModule } from './health/health.module'
// ...existing code...
import { WishlistModule } from './wishlist/wishlist.module'
import { ClientErrorsController } from './shared/errors/client-errors.controller'
import { User } from './users/user.entity'
import { Category } from './catalog/category.entity'
import { Product } from './catalog/product.entity'


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Category, Product]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000, // 60 seconds
      limit: 1000, // 1000 requests per minute for SPA
    }]),
    // CacheModule.register({
    //   isGlobal: true,
    //   store: redisStore,
    //   host: process.env.REDIS_HOST || 'localhost',
    //   port: parseInt(process.env.REDIS_PORT || '6379', 10),
    //   ttl: 300, // 5 minutes default TTL
    // }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres' as const,
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        username: process.env.POSTGRES_USER || 'souvenir',
        password: process.env.POSTGRES_PASSWORD || 'souvenir',
        database: process.env.POSTGRES_DB || 'souvenir',
        autoLoadEntities: true,
        // IMPORTANT: Use migrations in production.
        // Temporary bootstrap flag for empty DBs: TYPEORM_SYNCHRONIZE=true
        synchronize:
          (process.env.TYPEORM_SYNCHRONIZE || '').toLowerCase() === 'true' ||
          process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV !== 'production' ? ['error', 'warn'] : false,
      }),
    }),
    CatalogModule,
    OrdersModule,
    UsersModule,
    AuthModule,
    B2bModule,
    OpsModule,
    AdminDbModule,

    MediaModule,

    ContentModule,

    AdminAnalyticsModule,
    AdminSettingsModule,

    AdminWarehouseModule,

    AdminInventoryModule,

    ProductionModule,

    CartModule,

    HealthModule,

  // ...existing code...

    WishlistModule,

  ],
  controllers: [AppController, ClientErrorsController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    require('./users/user-admin-script.service').UserAdminScriptService,
  ],
})

// ...existing code...
export class AppModule {}
