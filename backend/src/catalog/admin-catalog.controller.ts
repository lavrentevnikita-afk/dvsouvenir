import {
  Body,
  Controller,
  Delete,
  Get,
  Req,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { CatalogService } from './catalog.service'
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateProductDto,
  UpdateProductDto,
  CloneProductDto,
  AdminProductsQueryDto,
  UpdateImageDto,
  BomItemDto,
} from './dto'

@Controller('api/admin/catalog')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminCatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // Categories
    /**
     * Экспорт товаров в CSV для 1С (Windows-1251)
     */
    @Get('export-csv')
    async exportProductsCsv(@Query() query: AdminProductsQueryDto, @Req() req: any) {
      const csv = await this.catalogService.exportProductsCsv(query)
      req.res.setHeader('Content-Type', 'text/csv; charset=windows-1251')
      req.res.setHeader('Content-Disposition', 'attachment; filename="products.csv"')
      return req.res.end(csv)
    }
  @Get('categories')
  listCategories() {
    return this.catalogService.adminGetCategories()
  }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalogService.createCategory(dto)
  }

  @Patch('categories/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.catalogService.updateCategory(id, dto)
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deleteCategory(id)
  }

  // Products
  @Get('products')
  listProducts(@Query() query: AdminProductsQueryDto) {
    return this.catalogService.adminListProducts(query)
  }

  // next article for a city (preview only, does NOT reserve/increment)
  @Get('next-article')
  nextArticle(@Query('city') city?: string) {
    return this.catalogService.peekNextArticle(city)
  }

  @Post('products')
  createProduct(@Req() req: any, @Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(dto, req?.user?.id ?? null)
  }

  @Patch('products/:id')
  updateProduct(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.catalogService.updateProduct(id, dto, req?.user?.id ?? null)
  }

  @Get('products/:id/history')
  getProductHistory(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.getProductHistory(id)
  }

  // BOM (recipe)
  @Get('products/:id/bom')
  getProductBom(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.adminGetProductBom(id)
  }

  @Put('products/:id/bom')
  replaceProductBom(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() items: BomItemDto[]) {
    return this.catalogService.adminReplaceProductBom(id, items as any, req?.user?.id ?? null)
  }

  // Copy product -> creates a hidden draft clone (new slug/article)
  @Post('products/:id/clone')
  cloneProduct(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CloneProductDto,
  ) {
    return this.catalogService.cloneProduct(id, req?.user?.id ?? null, dto)
  }

  @Delete('products/:id')
  deleteProduct(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deleteProduct(id, req?.user?.id ?? null)
  }

  // Images (Object Storage)
  @Post('products/:id/images')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )

  uploadProductImage(
    @Req() req: any,
    @Param('id', ParseIntPipe) productId: number,
    @UploadedFile() file?: any,
  ) {
    return this.catalogService.uploadProductImage(productId, file, req?.user?.id ?? null)
  }

  @Patch('images/:id')
  updateImage(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateImageDto) {
    return this.catalogService.updateImage(id, dto, req?.user?.id ?? null)
  }

  @Delete('images/:id')
  deleteImage(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deleteImage(id, req?.user?.id ?? null)
  }
}
