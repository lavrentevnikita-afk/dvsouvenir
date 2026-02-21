import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { CreatePromoBannerDto, UpdatePromoBannerDto } from './dto'
import { ContentService } from './content.service'

@Controller('api/admin/content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('promo-banners')
  listPromoBanners() {
    return this.contentService.adminListPromoBanners()
  }

  @Post('promo-banners')
  createPromoBanner(@Body() dto: CreatePromoBannerDto) {
    return this.contentService.createPromoBanner(dto)
  }

  @Patch('promo-banners/:id')
  updatePromoBanner(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePromoBannerDto) {
    return this.contentService.updatePromoBanner(id, dto)
  }

  @Delete('promo-banners/:id')
  deletePromoBanner(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.deletePromoBanner(id)
  }
}
