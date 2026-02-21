import { Controller, Get, Param, Patch, Query, Body, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { B2bService } from './b2b.service'

@Controller('/api/admin/shops')
export class AdminShopsController {
  constructor(private readonly b2bService: B2bService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @Get()
  list(@Req() req: any, @Query('status') status?: string, @Query('city') city?: string, @Query('q') q?: string) {
    return this.b2bService.listShops(req.user, { status, city, q })
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) {
    return this.b2bService.getShop(req.user, Number(id))
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @Patch(':id')
  patch(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { status?: string; discountPercent?: number; notes?: string | null },
  ) {
    return this.b2bService.updateShop(req.user, Number(id), body)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @Get(':id/orders')
  orders(
    @Req() req: any,
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.b2bService.getShopOrders(req.user, Number(id), { status, dateFrom, dateTo })
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @Get(':id/audit')
  audit(@Req() req: any, @Param('id') id: string) {
    return this.b2bService.getShopAudit(req.user, Number(id))
  }
}
