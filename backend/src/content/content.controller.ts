import { Controller, Get } from '@nestjs/common'
import { ContentService } from './content.service'

@Controller('api/content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('promo-banners')
  listPromoBanners() {
    return this.contentService.listActivePromoBanners()
  }
}
