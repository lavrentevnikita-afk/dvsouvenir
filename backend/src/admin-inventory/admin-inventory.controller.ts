import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { AdminInventoryService } from './admin-inventory.service'

type WarehouseCode = 'BLANKS' | 'FINISHED' | 'DEFECT'

function parseWarehouseCodeOrUndefined(input?: string): WarehouseCode | undefined {
  if (input == null || String(input).trim() === '') return undefined
  const wh = String(input).trim().toUpperCase()
  if (wh === 'BLANKS' || wh === 'FINISHED' || wh === 'DEFECT') return wh
  throw new BadRequestException('warehouse must be BLANKS|FINISHED|DEFECT')
}

@Controller('/api/admin/inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminInventoryController {
  constructor(private readonly svc: AdminInventoryService) {}

  /**
   * GET /api/admin/inventory?status=draft|applied&warehouse=BLANKS|FINISHED|DEFECT
   */
  @Get()
  async list(@Query('status') status?: string, @Query('warehouse') warehouse?: string) {
    const st = status ? String(status).toLowerCase() : undefined
    if (st && !['draft', 'applied'].includes(st)) throw new BadRequestException('status must be draft|applied')
    const wh = parseWarehouseCodeOrUndefined(warehouse)
    return this.svc.listSessions({ status: st as any, warehouse: wh })
  }

  /**
   * GET /api/admin/inventory/:id
   */
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getSession(id)
  }

  /**
   * POST /api/admin/inventory (create session + snapshot)
   * body: { warehouseId?: number, warehouse?: 'BLANKS'|'FINISHED'|'DEFECT' }
   */
  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const userId = Number(req?.user?.id || 0) || null
    return this.svc.createSession({ warehouseId: body?.warehouseId, warehouse: body?.warehouse, userId })
  }

  /**
   * PUT /api/admin/inventory/:id/lines (fill fact)
   * body: { lines: Array<{ productId: number, factQty: number | null }> }
   */
  @Put(':id/lines')
  async updateLines(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const lines = Array.isArray(body?.lines) ? body.lines : []
    return this.svc.updateLines(id, lines)
  }

  /**
   * POST /api/admin/inventory/:id/apply
   */
  @Post(':id/apply')
  async apply(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = Number(req?.user?.id || 0) || null
    return this.svc.applySession(id, userId)
  }
}
