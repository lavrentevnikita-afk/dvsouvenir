import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { OpsService, OrderStatus } from './ops.service'

@Controller('/api/ops')
export class OpsController {
  constructor(private readonly opsService: OpsService) {}

  private assertStaff(req: any) {
    if (req?.user?.role !== 'manager' && req?.user?.role !== 'admin') {
      throw new NotFoundException('Not found')
    }
  }

  private assertAdmin(req: any) {
    if (req?.user?.role !== 'admin') {
      throw new NotFoundException('Not found')
    }
  }

  // ----- Orders -----

  // ----- In work (сборка/комплектация) -----

  @UseGuards(JwtAuthGuard)
  @Get('in-work')
  inWork(
    @Req() req: any,
    @Query('priority') priority?: string,
    @Query('deadline') deadline?: string,
    @Query('assignee') assignee?: string,
    @Query('warehouse') warehouse?: string,
  ) {
    this.assertStaff(req)
    return this.opsService.listInWork({ priority, deadline, assignee, warehouse })
  }

  @UseGuards(JwtAuthGuard)
  @Patch('in-work/:id/meta')
  setInWorkMeta(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    this.assertStaff(req)
    return this.opsService.setInWorkMeta(id, {
      priority: typeof body?.priority === 'undefined' ? undefined : body.priority,
      deadlineAt: typeof body?.deadlineAt === 'undefined' ? undefined : body.deadlineAt,
      assignee: typeof body?.assignee === 'undefined' ? undefined : body.assignee,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Patch('in-work/:id/check')
  togglePick(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    this.assertStaff(req)
    return this.opsService.toggleChecklist(id, Number(body?.productId), Boolean(body?.checked))
  }

  @UseGuards(JwtAuthGuard)
  @Post('in-work/:id/ready')
  readyToShip(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    this.assertStaff(req)
    return this.opsService.markReadyToShip(id, body?.warehouse || 'FINISHED')
  }

  // ----- Dashboard (операционная сводка) -----

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  dashboard(
    @Req() req: any,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('warehouse') warehouse?: string,
  ) {
    this.assertStaff(req)
    return this.opsService.dashboard({ dateFrom, dateTo, warehouse, userId: req?.user?.id })
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  listOrders(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('warehouse') warehouse?: string,
    @Query('store') store?: string,
    @Query('problematic') problematic?: string,
    @Query('overdue') overdue?: string,
  ) {
    this.assertStaff(req)
    return this.opsService.listOrders({ status, q, dateFrom, dateTo, warehouse, store, problematic, overdue })
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  getOrder(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Query('warehouse') warehouse?: string) {
    this.assertStaff(req)
    return this.opsService.getOrder(id, warehouse)
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/accept')
  acceptOrder(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    this.assertStaff(req)
    return this.opsService.acceptOrder(id, body?.warehouse || OpsService.DEFAULT_WAREHOUSE)
  }

  // Этап 3: Комплектация/резервы

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/allocate')
  allocate(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    this.assertStaff(req)
    return this.opsService.allocateOrder(id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id/allocations')
  allocations(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    this.assertStaff(req)
    return this.opsService.getAllocations(id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/release')
  release(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    this.assertStaff(req)
    return this.opsService.releaseAllocations(id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/cancel')
  cancelOrder(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    this.assertStaff(req)
    return this.opsService.cancelOrder(id)
  }

  // Опасно: физическое удаление заказа (для чистки тестовых заказов)
  @UseGuards(JwtAuthGuard)
  @Delete('orders/:id')
  deleteOrder(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    // ❗️только админ (менеджеру нельзя иметь «опасные» права)
    this.assertAdmin(req)
    const confirm = String(body?.confirm || '')
    if (confirm !== 'YES_DELETE') {
      throw new BadRequestException('confirm=YES_DELETE required')
    }
    return this.opsService.deleteOrderHard(id, req?.user?.id ?? null)
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/production')
  createProduction(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    this.assertStaff(req)
    return this.opsService.createProductionForDeficit(id, body?.warehouse || OpsService.DEFAULT_WAREHOUSE)
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/shipment')
  createShipment(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    this.assertStaff(req)
    return this.opsService.createShipment(id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/ship')
  confirmShipped(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    this.assertStaff(req)
    return this.opsService.confirmShipped(id)
  }

  // ----- Shipments -----

  @UseGuards(JwtAuthGuard)
  @Get('shipments')
  listShipments(
    @Req() req: any,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: string,
    @Query('store') store?: string,
  ) {
    this.assertStaff(req)
    return this.opsService.listShipments({ dateFrom, dateTo, status, store })
  }

  @UseGuards(JwtAuthGuard)
  @Post('shipments/:id/confirm')
  confirmShipment(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.assertStaff(req)
    return this.opsService.confirmShipmentById(id, {
      shippedAt: body?.shippedAt,
      comment: body?.comment,
      waybillNumber: body?.waybillNumber,
      photoUrl: body?.photoUrl,
      warehouse: body?.warehouse,
      confirmedByUserId: req?.user?.id,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Post('shipments/:id/partial')
  partialShipment(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.assertStaff(req)
    return this.opsService.partialShipmentById(id, {
      items: Array.isArray(body?.items) ? body.items : [],
      shippedAt: body?.shippedAt,
      comment: body?.comment,
      waybillNumber: body?.waybillNumber,
      photoUrl: body?.photoUrl,
      warehouse: body?.warehouse,
      confirmedByUserId: req?.user?.id,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Patch('shipments/:id/status')
  setShipmentStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.assertStaff(req)
    return this.opsService.setShipmentStatus(id, body?.status, req?.user?.id)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('orders/:id/status')
  setOrderStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.assertStaff(req)
    const status = body?.status as OrderStatus
    const warehouse = (body?.warehouse as string) || OpsService.DEFAULT_WAREHOUSE
    return this.opsService.setOrderStatus(id, status, warehouse, req?.user?.id ?? null)
  }

  // ----- Comments -----

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id/comments')
  listComments(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    this.assertStaff(req)
    return this.opsService.listComments(id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/comments')
  addComment(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.assertStaff(req)
    return this.opsService.addComment(id, req.user.id, body?.text)
  }

  // ----- Warehouses & Stocks -----

  @UseGuards(JwtAuthGuard)
  @Get('warehouses')
  listWarehouses(@Req() req: any) {
    this.assertAdmin(req)
    return this.opsService.listWarehouses()
  }

  @UseGuards(JwtAuthGuard)
  @Post('warehouses')
  upsertWarehouse(@Req() req: any, @Body() body: any) {
    this.assertAdmin(req)
    return this.opsService.upsertWarehouse(body?.code, body?.name, body?.regionCode)
  }

  @UseGuards(JwtAuthGuard)
  @Delete('warehouses/:code')
  deleteWarehouse(@Req() req: any, @Param('code') code: string) {
    this.assertAdmin(req)
    return this.opsService.deleteWarehouse(code)
  }

  // ----- Cities (reference table) -----

  @UseGuards(JwtAuthGuard)
  @Get('cities')
  listCities(@Req() req: any) {
    this.assertAdmin(req)
    return this.opsService.listCities()
  }

  @UseGuards(JwtAuthGuard)
  @Post('cities')
  upsertCity(@Req() req: any, @Body() body: any) {
    this.assertAdmin(req)
    return this.opsService.upsertCity(body?.code, body?.name, body?.regionCode)
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cities/:code')
  deleteCity(@Req() req: any, @Param('code') code: string) {
    this.assertAdmin(req)
    return this.opsService.deleteCity(code)
  }

  @UseGuards(JwtAuthGuard)
  @Get('stocks')
  listStocks(@Req() req: any, @Query('warehouse') warehouse?: string) {
    this.assertAdmin(req)
    return this.opsService.listStocks(warehouse || OpsService.DEFAULT_WAREHOUSE)
  }

  @UseGuards(JwtAuthGuard)
  @Post('stocks/receive')
  receive(@Req() req: any, @Body() body: any) {
    this.assertAdmin(req)
    return this.opsService.receiveStock(body?.warehouse || OpsService.DEFAULT_WAREHOUSE, Number(body?.productId), Number(body?.qty), body?.note, req?.user?.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('stocks/issue')
  issue(@Req() req: any, @Body() body: any) {
    this.assertAdmin(req)
    return this.opsService.issueStock(body?.warehouse || OpsService.DEFAULT_WAREHOUSE, Number(body?.productId), Number(body?.qty), body?.note, req?.user?.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('stocks/adjust')
  adjust(@Req() req: any, @Body() body: any) {
    this.assertAdmin(req)
    return this.opsService.adjustStock(body?.warehouse || OpsService.DEFAULT_WAREHOUSE, Number(body?.productId), Number(body?.qty), body?.note, req?.user?.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('stocks/transfer')
  transfer(@Req() req: any, @Body() body: any) {
    this.assertAdmin(req)
    return this.opsService.transferStock(
      body?.fromWarehouse || body?.warehouse || OpsService.DEFAULT_WAREHOUSE,
      body?.toWarehouse,
      Number(body?.productId),
      Number(body?.qty),
      body?.note,
      req?.user?.id,
    )
  }

  // ----- Movements -----

  @UseGuards(JwtAuthGuard)
  @Get('movements')
  listMovements(
    @Req() req: any,
    @Query('warehouse') warehouse?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('productId') productId?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    this.assertAdmin(req)
    return this.opsService.listMovements({ warehouse, dateFrom, dateTo, productId, type, limit })
  }

  // ----- Inventory -----

  @UseGuards(JwtAuthGuard)
  @Get('inventories')
  listInventories(@Req() req: any, @Query('warehouse') warehouse?: string) {
    this.assertAdmin(req)
    return this.opsService.listInventories(warehouse || OpsService.DEFAULT_WAREHOUSE)
  }

  @UseGuards(JwtAuthGuard)
  @Post('inventories')
  createInventory(@Req() req: any, @Body() body: any) {
    this.assertAdmin(req)
    return this.opsService.createInventory(body?.warehouse || OpsService.DEFAULT_WAREHOUSE, req?.user?.id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('inventories/:id')
  getInventory(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    this.assertAdmin(req)
    return this.opsService.getInventory(id)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('inventories/:id/items/:itemId')
  updateInventoryItem(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() body: any,
  ) {
    this.assertAdmin(req)
    return this.opsService.updateInventoryItem(id, itemId, Number(body?.actualQty))
  }

  @UseGuards(JwtAuthGuard)
  @Post('inventories/:id/apply')
  applyInventory(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    this.assertAdmin(req)
    return this.opsService.applyInventory(id, req?.user?.id)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('stocks/min')
  setMin(@Req() req: any, @Body() body: any) {
    this.assertAdmin(req)
    return this.opsService.setStockMinQty(body?.warehouse || OpsService.DEFAULT_WAREHOUSE, Number(body?.productId), Number(body?.minQty))
  }

  // ----- Production -----

  @UseGuards(JwtAuthGuard)
  @Get('production')
  listProduction(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('orderId') orderId?: string,
    @Query('q') q?: string,
  ) {
    this.assertAdmin(req)
    return this.opsService.listProduction({ status, orderId, q })
  }

  @UseGuards(JwtAuthGuard)
  @Patch('production/:id/status')
  setProductionStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.assertAdmin(req)
    return this.opsService.setProductionStatus(id, body?.status)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('production/:id/meta')
  updateProductionMeta(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.assertAdmin(req)
    return this.opsService.updateProductionMeta(id, {
      deadlineAt: body?.deadlineAt ?? undefined,
      assignee: body?.assignee ?? undefined,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Post('production/:id/reserve-blanks')
  reserveBlanks(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.assertAdmin(req)
    return this.opsService.reserveProductionBlanks(id, body?.warehouse || 'BLANKS', req?.user?.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('production/:id/start')
  startProduction(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.assertAdmin(req)
    return this.opsService.startProductionTask(
      id,
      { warehouse: body?.warehouse || OpsService.DEFAULT_WAREHOUSE, consume: !!body?.consume },
      req?.user?.id,
    )
  }

  @UseGuards(JwtAuthGuard)
  @Post('production/:id/finish')
  finishProduction(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.assertAdmin(req)
    return this.opsService.finishProductionTask(id, { warehouse: body?.warehouse || OpsService.DEFAULT_WAREHOUSE }, req?.user?.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('production/:id/move-to-stock')
  moveToStock(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.assertAdmin(req)
    return this.opsService.moveProductionToStock(id, body?.warehouse || OpsService.DEFAULT_WAREHOUSE, req?.user?.id)
  }

  // ----- Этап B: backoffice one-off repair -----

  @UseGuards(JwtAuthGuard)
  @Post('admin/repair-stocks')
  repairStocks(@Req() req: any) {
    this.assertAdmin(req)
    return this.opsService.repairMissingStocksForAllProducts()
  }

  // ----- Этап C: отчёт и миграция legacy-складов -----

  @UseGuards(JwtAuthGuard)
  @Get('admin/legacy-warehouses-report')
  legacyWarehousesReport(@Req() req: any) {
    this.assertAdmin(req)
    return this.opsService.legacyWarehousesReport()
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/migrate-legacy-warehouses')
  migrateLegacyWarehouses(@Req() req: any, @Body() body: any) {
    this.assertAdmin(req)
    return this.opsService.migrateAndRemoveLegacyWarehouses({ dryRun: !!body?.dryRun })
  }
}
