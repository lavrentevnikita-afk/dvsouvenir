import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { OrdersService } from '../orders/orders.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { ManagerOrdersFilterDto } from '../orders/dto/manager-orders-filter.dto'
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto'
import { AssignManagerDto } from '../orders/dto/assign-manager.dto'

/**
 * Контроллер для менеджерской панели управления заказами
 * Доступен только для пользователей с ролью 'manager' или 'admin'
 */
@Controller('api/manager/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager', 'admin')
export class ManagerOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Получить все заказы с фильтрами
   * GET /api/manager/orders
   */
  @Get()
  async getAllOrders(@Query() filters: ManagerOrdersFilterDto) {
    return this.ordersService.getAllForManager(filters)
  }

  /**
   * Получить детальную информацию о заказе
   * GET /api/manager/orders/:id
   */
  @Get(':id')
  async getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOneForManager(id)
  }

  /**
   * Обновить статус заказа
   * PATCH /api/manager/orders/:id/status
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto.status, dto.note)
  }

  /**
   * Назначить менеджера на заказ
   * PATCH /api/manager/orders/:id/assign
   */
  @Patch(':id/assign')
  @HttpCode(HttpStatus.OK)
  async assignManager(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignManagerDto,
  ) {
    return this.ordersService.assignManager(id, dto.managerId)
  }

  /**
   * Получить статистику заказов
   * GET /api/manager/orders/stats/summary
   */
  @Get('stats/summary')
  async getStats() {
    // Statistics implementation pending - return basic metrics for now
    return {
      totalOrders: 0,
      newOrders: 0,
      processingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
    }
  }
}
