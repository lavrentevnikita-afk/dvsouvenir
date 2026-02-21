import {
  Body,
  Controller,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { OpsService } from './ops.service'

@Controller('/api/admin/production')
export class ProductionAdminController {
  constructor(private readonly opsService: OpsService) {}

  private assertAdmin(req: any) {
    if (req?.user?.role !== 'admin') throw new NotFoundException('Not found')
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  list(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('orderId') orderId?: string,
    @Query('q') q?: string,
  ) {
    this.assertAdmin(req)
    return this.opsService.listWorkOrders({ status, orderId, q })
  }

  // создать WorkOrders по заказу (по дефициту FINISHED)
  @UseGuards(JwtAuthGuard)
  @Post('from-order/:orderId')
  createFromOrder(@Req() req: any, @Param('orderId', ParseIntPipe) orderId: number) {
    this.assertAdmin(req)
    return this.opsService.createWorkOrdersFromOrder(orderId)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':woId/start')
  start(@Req() req: any, @Param('woId', ParseIntPipe) woId: number) {
    this.assertAdmin(req)
    return this.opsService.startWorkOrder(woId, req?.user?.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':woId/complete')
  complete(
    @Req() req: any,
    @Param('woId', ParseIntPipe) woId: number,
    @Body() body: any,
  ) {
    this.assertAdmin(req)
    return this.opsService.completeWorkOrder(woId, Number(body?.qty || 0), req?.user?.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':woId/defect')
  defect(
    @Req() req: any,
    @Param('woId', ParseIntPipe) woId: number,
    @Body() body: any,
  ) {
    this.assertAdmin(req)
    return this.opsService.defectWorkOrder(woId, Number(body?.qty || 0), req?.user?.id)
  }
}
