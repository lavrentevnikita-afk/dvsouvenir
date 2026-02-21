import { Controller, Get, Param, ParseIntPipe, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common'
// import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager'
import { SkipThrottle } from '@nestjs/throttler'
import { CatalogService } from './catalog.service'
import { GetProductsQueryDto, SearchQueryDto, SuggestQueryDto } from './dto'
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard'

@SkipThrottle() // Public catalog endpoints should not be rate limited
@Controller('api/catalog')
// @UseInterceptors(CacheInterceptor)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  // @CacheTTL(600) // Cache for 10 minutes
  getCategories() {
    return this.catalogService.getCategoriesTree()
  }

  // Public: category details + breadcrumb chain
  @Get('categories/:slug')
  // @CacheTTL(300) // Cache for 5 minutes
  getCategoryBySlug(@Param('slug') slug: string) {
    return this.catalogService.getCategoryBySlug(slug)
  }

  // Public list of cities/warehouses
  @Get('cities')
  // @CacheTTL(3600) // Cache for 1 hour
  getCities() {
    return this.catalogService.getCities()
  }

  @Get('products')
  @UseGuards(OptionalJwtAuthGuard)
  getProducts(@Query() query: GetProductsQueryDto, @Req() req: any) {
    return this.catalogService.getProducts(query, req?.user ?? null)
  }

  // Public: dynamic filters (facets) for the left sidebar.
  // Returns specs metadata (enum values + numeric ranges) for products in the category.
  @Get('filters')
  getFilters(@Query() query: GetProductsQueryDto) {
    return this.catalogService.getFilters(query)
  }

  @Get('products/:id')
  @UseGuards(OptionalJwtAuthGuard)
  getProduct(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.catalogService.getProduct(id, req?.user ?? null)
  }

  @Get('search')
  @UseGuards(OptionalJwtAuthGuard)
  search(@Query() query: SearchQueryDto, @Req() req: any) {
    return this.catalogService.search(query, req?.user ?? null)
  }

  // Public: instant suggestions for the header search bar (products + categories).
  @Get('suggest')
  @UseGuards(OptionalJwtAuthGuard)
  suggest(@Query() query: SuggestQueryDto, @Req() req: any) {
    return this.catalogService.suggest(query, req?.user ?? null)
  }
}
