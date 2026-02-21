import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import * as express from 'express'
import { join } from 'path'
import * as fs from 'fs'
// import * as helmet from 'helmet'
import { RequestIdMiddleware } from './shared/http/request-id.middleware'
import { AllExceptionsFilter } from './shared/errors/all-exceptions.filter'
import { winstonConfig } from './shared/config/winston.config'

async function bootstrap() {
  const logger = winstonConfig

  // CORS configuration
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:4000']

  const app = await NestFactory.create(AppModule, {
    logger: winstonConfig,
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    },
  })

  // Security headers with Helmet
  // app.use(helmet({
  //   contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  //   crossOriginEmbedderPolicy: false,
  // }))

  // Request correlation
  app.use(new RequestIdMiddleware().use)
  app.useGlobalFilters(new AllExceptionsFilter())

  // Local uploads are disabled by default. Images are stored in Object Storage.
  // You may enable local /uploads serving for backward compatibility by setting:
  // ENABLE_LOCAL_UPLOADS=true
  if ((process.env.ENABLE_LOCAL_UPLOADS || '').toLowerCase() === 'true') {
    // ✅ ВАЖНО: используем process.cwd(), чтобы путь не «съезжал» после сборки в dist/
    // В Docker (working_dir: /app) это будет /app/uploads
    const uploadsDir = join(process.cwd(), 'uploads')
    const productsDir = join(uploadsDir, 'products')
    const staticDir = join(uploadsDir, 'static')

    if (!fs.existsSync(productsDir)) fs.mkdirSync(productsDir, { recursive: true })
    if (!fs.existsSync(staticDir)) fs.mkdirSync(staticDir, { recursive: true })

    // Раздаём /uploads/... из реальной папки uploads
      // Seed test data
      const testDataService = app.get('TestDataService');
      await testDataService.seed();
    app.use('/uploads', express.static(uploadsDir))
    logger.log(`Static uploads dir: ${uploadsDir}`)
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true, // Changed to true for better security
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  // Swagger API Documentation
  // if (process.env.NODE_ENV !== 'production') {
  //   const config = new DocumentBuilder()
  //     .setTitle('Souvenir Shop API')
  //     .setDescription('API documentation for Souvenir Shop e-commerce platform')
  //     .setVersion('0.4.0')
  //     .addBearerAuth()
  //     .addTag('auth', 'Authentication endpoints')
  //     .addTag('catalog', 'Product catalog and categories')
  //     .addTag('b2b', 'B2B store management')
  //     .addTag('orders', 'Order management')
  //     .addTag('cart', 'Shopping cart')
  //     .addTag('admin', 'Admin panel')
  //     .build()
  //   
  //   const document = SwaggerModule.createDocument(app, config)
  //   SwaggerModule.setup('api/docs', app, document, {
  //     customSiteTitle: 'Souvenir Shop API',
  //     customCss: '.swagger-ui .topbar { display: none }',
  //   })
  // }

  const port = process.env.PORT || 4000
  await app.listen(port)
  
  logger.log(`🚀 Souvenir Shop backend is running on http://localhost:${port}`)
  logger.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  logger.log(`💾 Database: ${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}`)
  logger.log(`🔴 Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`)
}

bootstrap()
