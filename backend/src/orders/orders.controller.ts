import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Res,
  Req,
  UseGuards,
  Query,
  StreamableFile,
} from '@nestjs/common'
import type { Response } from 'express'
import { OrdersService } from './orders.service'
import { CreateOrderDto, GetOrdersFilterDto } from './dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { PdfService } from '../shared/pdf.service'
import * as iconv from 'iconv-lite'

@Controller('/api/orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly pdfService: PdfService,
  ) {}

  // Подтвердить получение заказа пользователем
  @Post(':id/confirm-received')
  @UseGuards(JwtAuthGuard)
  async confirmReceived(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    try {
      const order = await this.ordersService.getOneByUser(id, req.user)
      if (!order) throw new NotFoundException('Заказ не найден')
      // Разрешаем подтверждение для любого заказа, кроме уже завершённых
      if (['delivered', 'completed', 'canceled'].includes(order.status)) {
        throw new NotFoundException('Заказ уже завершён или отменён')
      }
      await this.ordersService.updateStatus(id, 'delivered')
      return { success: true }
    } catch (error) {
      console.error('Ошибка подтверждения получения заказа:', error)
      throw error
    }
  }

  // создание заказа
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateOrderDto, @Req() req: any) {
    // Привязываем заказ к email из токена, чтобы он гарантированно отображался в кабинете
    const emailFromToken: string | undefined = req?.user?.email
    const normalizedEmail = emailFromToken?.trim().toLowerCase()

    const u = req.user

    return this.ordersService.createWithUser({
      ...dto,
      // автоподстановка, если поле пустое
      customerName: dto.customerName || u?.name,
      email: normalizedEmail ?? dto.email,
      phone: dto.phone || u?.phone || undefined,
    }, req.user)
  }

  // Мои заказы (по email из токена)
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyOrders(@Req() req: any, @Query() filters: GetOrdersFilterDto) {
    // Если есть фильтры - используем новый метод с пагинацией
    if (filters.status || filters.dateFrom || filters.dateTo || filters.search || filters.page || filters.limit) {
      return this.ordersService.getMyOrdersWithFilters(req.user, filters)
    }
    
    // Backward compatible: без фильтров возвращаем старый формат
    const orders = await this.ordersService.getMyOrdersForUser(req.user)
    return { orders }
  }

  // Админ: все заказы (для менеджера)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @Get('admin/all')
  async adminAll(@Req() req: any) {
    const orders = await this.ordersService.findAll()
    return { orders }
  }

  // один заказ по id
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    // Используем новый метод с встроенной проверкой доступа
    const order = await this.ordersService.getOneByUser(id, req.user)
    return { order }
  }

  // Чек/счёт (единый генератор данных)
  @UseGuards(JwtAuthGuard)
  @Get(':id/receipt')
  async getReceipt(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const receipt = await this.ordersService.getReceiptData(id, req.user)
    return { receipt }
  }

  // B2B: скачать счёт (HTML, который можно распечатать в PDF)
  @UseGuards(JwtAuthGuard)
  @Get(':id/invoice')
  async downloadInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const receipt = await this.ordersService.getReceiptData(id, req.user)

    // Только для B2B (store), admin/manager можно тоже для отладки
    const role = req?.user?.role
    if (role !== 'store' && role !== 'admin' && role !== 'manager') {
      throw new NotFoundException('Not found')
    }

    const fmt = (n: number) => (Number.isFinite(n) ? Math.round(n).toLocaleString('ru-RU') : '0')
    const title = `Счёт по заказу №${receipt.orderId}`

    const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#111}
    h1{font-size:20px;margin:0 0 8px}
    .muted{color:#666;font-size:12px}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th,td{border:1px solid #ddd;padding:8px;font-size:12px;vertical-align:top}
    th{background:#f7f7f7;text-align:left}
    .right{text-align:right;white-space:nowrap}
    .totals{margin-top:16px;display:flex;justify-content:flex-end}
    .totals table{width:auto;margin:0}
    .badge{display:inline-block;padding:2px 8px;border-radius:999px;background:#111;color:#fff;font-size:11px}
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="muted">Дата: ${new Date(receipt.createdAt).toLocaleString('ru-RU')}</div>
  <div class="muted">Покупатель/магазин: ${receipt.customerName || receipt.email}</div>
  <div class="muted">Статус: <span class="badge">${receipt.status}</span></div>

  <table>
    <thead>
      <tr>
        <th>Позиция</th>
        <th class="right">Кол-во</th>
        <th class="right">Цена (опт)</th>
        <th class="right">Сумма</th>
      </tr>
    </thead>
    <tbody>
      ${receipt.items
        .map((i) => {
          const final = i.finalUnit
          const line = i.finalLine
          return `<tr>
            <td>${i.name}</td>
            <td class="right">${i.quantity}</td>
            <td class="right">${fmt(final)} ₽</td>
            <td class="right"><b>${fmt(line)} ₽</b></td>
          </tr>`
        })
        .join('')}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr><th>Итого по заказу</th><td class="right"><b>${fmt(receipt.totals.final)} ₽</b></td></tr>
    </table>
  </div>

  <p class="muted" style="margin-top:16px">Подсказка: откройте этот файл в браузере и выберите «Печать» → «Сохранить как PDF».</p>
</body>
</html>`

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="invoice-order-${receipt.orderId}.html"`)
    res.send(html)
  }

  // Download invoice as PDF
  @Get(':id/invoice-pdf')
  @UseGuards(JwtAuthGuard)
  async downloadInvoicePdf(@Param('id', ParseIntPipe) id: number, @Req() req: any, @Res() res: Response) {
    const order = await this.ordersService.findOne(id)
    if (!order) throw new NotFoundException('Заказ не найден')

    // Check access: only owner, manager, or admin
    const userEmail = req.user?.email?.trim().toLowerCase()
    const orderEmail = order.email?.trim().toLowerCase()
    const isOwner = userEmail === orderEmail
    const isStaff = req.user?.role === 'admin' || req.user?.role === 'manager'

    if (!isOwner && !isStaff) {
      throw new NotFoundException('Заказ не найден')
    }

    const pdfBuffer = await this.pdfService.generateInvoice(order)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${order.id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    })

    res.end(pdfBuffer)
  }

  // Download waybill as PDF
  @Get(':id/waybill-pdf')
  @UseGuards(JwtAuthGuard)
  async downloadWaybillPdf(@Param('id', ParseIntPipe) id: number, @Req() req: any, @Res() res: Response) {
    const order = await this.ordersService.findOne(id)
    if (!order) throw new NotFoundException('Заказ не найден')

    // Check access: only owner, manager, or admin
    const userEmail = req.user?.email?.trim().toLowerCase()
    const orderEmail = order.email?.trim().toLowerCase()
    const isOwner = userEmail === orderEmail
    const isStaff = req.user?.role === 'admin' || req.user?.role === 'manager'

    if (!isOwner && !isStaff) {
      throw new NotFoundException('Заказ не найден')
    }

    const pdfBuffer = await this.pdfService.generateWaybill(order)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="waybill-${order.id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    })

    res.end(pdfBuffer)
  }

  // Download packing list as PDF (for production/manager)
  @Get(':id/packing-list-pdf')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  async downloadPackingListPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const order = await this.ordersService.findOne(id)
    if (!order) throw new NotFoundException('Заказ не найден')

    const pdfBuffer = await this.pdfService.generatePackingList(order)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="packing-list-${order.id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    })

    res.end(pdfBuffer)
  }

  // Админ: экспорт заказов в CSV
  @Get('admin/export-csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  async exportOrdersCsv(@Res() res: Response) {
    const csvBuffer = await this.ordersService.exportOrdersCsv()
    res.setHeader('Content-Type', 'text/csv; charset=windows-1251')
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"')
    res.send(csvBuffer)
  }
}
