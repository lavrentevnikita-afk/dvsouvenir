import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { AdminWarehouseService } from './admin-warehouse.service'

type WarehouseCode = 'BLANKS' | 'FINISHED' | 'DEFECT'

function parseWarehouseCode(input?: string): WarehouseCode {
  const wh = String(input || 'FINISHED').trim().toUpperCase()
  if (wh === 'BLANKS' || wh === 'FINISHED' || wh === 'DEFECT') return wh
  throw new BadRequestException('warehouse must be one of: BLANKS|FINISHED|DEFECT')
}

@Controller('/api/admin/warehouse')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminWarehouseController {
  constructor(private readonly svc: AdminWarehouseService) {}

  /**
   * GET /api/admin/warehouse/items?warehouse=BLANKS|FINISHED|DEFECT
   */
  @Get('items')
  async items(@Query('warehouse') warehouse?: string) {
    const wh = parseWarehouseCode(warehouse)
    return this.svc.listItems(wh)
  }

  /**
   * GET /api/admin/warehouse/movements?warehouse=&productId=&orderId=&workOrderId=&dateFrom=&dateTo=
   */
  @Get('movements')
  async movements(
    @Query('warehouse') warehouse?: string,
    @Query('productId') productId?: string,
    @Query('orderId') orderId?: string,
    @Query('workOrderId') workOrderId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const wh = parseWarehouseCode(warehouse)
    return this.svc.listMovements({ warehouse: wh, productId, orderId, workOrderId, dateFrom, dateTo })
  }
}
