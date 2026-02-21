import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { AdminSettingsService } from './admin-settings.service'

@Controller('/api/admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminSettingsController {
  constructor(private readonly s: AdminSettingsService) {}

  @Get('users')
  listUsers() {
    return this.s.listUsers()
  }

  @Patch('users/:id/role')
  setUserRole(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.s.setUserRole(req.user, id, String(dto?.role || ''))
  }

  @Get('dicts/issue-reasons')
  getIssueReasons() {
    return this.s.getIssueReasons()
  }

  @Put('dicts/issue-reasons')
  setIssueReasons(@Req() req: any, @Body() dto: any) {
    return this.s.setIssueReasons(req.user, Array.isArray(dto?.reasons) ? dto.reasons : [])
  }

  @Get('audit')
  listAudit(@Query('limit') limit?: string) {
    return this.s.listAudit(limit ? Number(limit) : 200)
  }

  // System: main warehouses ids (BLANKS/FINISHED/DEFECT)
  @Get('main-warehouses')
  getMainWarehouses() {
    return this.s.getMainWarehouses()
  }

  @Put('main-warehouses')
  setMainWarehouses(@Req() req: any, @Body() dto: any) {
    return this.s.setMainWarehouses(req.user, dto)
  }
}
