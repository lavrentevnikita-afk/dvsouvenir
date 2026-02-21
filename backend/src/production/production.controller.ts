import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { ProductionService } from './production.service'

@Controller('/api/production')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('production', 'admin')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  // Очередь производства: только заказы "in_work" (без цен)
  @Get('queue')
  queue(
    @Req() req: any,
    @Query('city') city?: string,
    @Query('priority') priority?: string,
    @Query('date') date?: string,
  ) {
    return this.productionService.getQueue(req?.user, { city, priority, date })
  }

  // Карточка заказа (без цен)
  @Get('orders/:id')
  getOrder(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.productionService.getOrderForProduction(id, req?.user)
  }

  // Отметить заказ готовым (по факту -> готов к отгрузке)
  @Post('orders/:id/mark-ready')
  markReady(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.productionService.markReady(id, req?.user)
  }

  // Чеклист по позициям (productId -> checked)
  @Post('orders/:id/checklist')
  setChecklist(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { productId: number; checked: boolean },
    @Req() req: any,
  ) {
    return this.productionService.setChecklist(id, body, req?.user)
  }
}
