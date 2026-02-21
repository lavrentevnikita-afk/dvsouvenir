import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { AdminAnalyticsService } from './admin-analytics.service'

@Controller('api/admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminAnalyticsController {
  constructor(private readonly svc: AdminAnalyticsService) {}

  @Get('summary')
  summary(@Query('days') daysRaw?: string) {
    const days = Math.min(365, Math.max(7, parseInt(String(daysRaw || '30'), 10) || 30))
    return this.svc.summary(days)
  }

  @Get('overview')
  overview(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('city') city?: string,
  ) {
    return this.svc.overview({ dateFrom, dateTo, city })
  }

  @Get('dashboard')
  dashboard() {
    return this.svc.dashboard()
  }

  @Get('sales')
  sales(@Query('days') daysRaw?: string) {
    const days = Math.min(365, Math.max(7, parseInt(String(daysRaw || '30'), 10) || 30))
    return this.svc.sales(days)
  }

  @Get('top-products')
  topProducts(
    @Query('limit') limitRaw?: string,
    @Query('sortBy') sortBy?: 'quantity' | 'revenue',
  ) {
    const limit = Math.min(50, Math.max(5, parseInt(String(limitRaw || '10'), 10) || 10))
    return this.svc.topProducts(limit, sortBy || 'revenue')
  }

  @Get('retail-vs-b2b')
  retailVsB2b() {
    return this.svc.retailVsB2b()
  }

  @Get('low-stock')
  lowStock(@Query('warehouse') warehouse?: 'BLANKS' | 'FINISHED') {
    return this.svc.lowStock(warehouse)
  }
}
