import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { B2bService } from './b2b.service'
import { RegisterStoreDto, UpdateStoreProfileDto } from './dto'

@Controller('/api/b2b')
export class B2bController {
  constructor(private readonly b2bService: B2bService) {}

  // регистрация магазина (НЕ трогаем /api/auth/register)
  @Post('register')
  register(@Body() dto: RegisterStoreDto) {
    return this.b2bService.registerStore(dto)
  }

  // профиль магазина
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.b2bService.getMe(req.user)
  }

  // обновление настроек магазина
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  updateProfile(@Req() req: any, @Body() dto: UpdateStoreProfileDto) {
    return this.b2bService.updateProfile(req.user, dto)
  }

  // список заявок/магазинов (для менеджера)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @Get('admin/stores')
  adminStores(@Req() req: any, @Query('status') status?: string) {
    return this.b2bService.listStoresForManager(req.user, status)
  }

  // активация менеджером
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @Post('activate/:userId')
  activate(@Req() req: any, @Param('userId') userId: string) {
    return this.b2bService.activateStore(req.user, Number(userId))
  }

  // принять (алиас)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @Post('admin/stores/:userId/approve')
  approve(@Req() req: any, @Param('userId') userId: string) {
    return this.b2bService.activateStore(req.user, Number(userId))
  }

  // отклонить
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @Post('admin/stores/:userId/reject')
  reject(@Req() req: any, @Param('userId') userId: string, @Body() dto: any) {
    return this.b2bService.rejectStore(req.user, Number(userId), dto)
  }

  // запросить уточнение
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @Post('admin/stores/:userId/request-info')
  requestInfo(@Req() req: any, @Param('userId') userId: string, @Body() dto: any) {
    return this.b2bService.requestStoreInfo(req.user, Number(userId), dto)
  }

  // история
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @Get('admin/stores/:userId/history')
  history(@Req() req: any, @Param('userId') userId: string) {
    return this.b2bService.storeModerationHistory(req.user, Number(userId))
  }

  // скидка магазина (для менеджера/админа)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @Patch('admin/stores/:userId/discount')
  setDiscount(@Req() req: any, @Param('userId') userId: string, @Body() body: any) {
    return this.b2bService.setStoreDiscountPercent(req.user, Number(userId), Number(body?.discountPercent))
  }

  // остатки по артикулам (для магазина и менеджера)
  // GET /api/b2b/stock?articles=SV-0001,SV-0002
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store', 'manager', 'admin')
  @Get('stock')
  stock(@Req() req: any, @Query('articles') articles?: string) {
    return this.b2bService.getStock(req.user, articles)
  }
}
