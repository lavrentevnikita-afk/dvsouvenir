import {
  IsArray,
  IsBoolean,
  IsBooleanString,
  IsInt,
  IsIn,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

// ----------------------
// Public catalog DTOs
// ----------------------

export class GetProductsQueryDto {
  @IsString()
  @IsOptional()
  category?: string

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  minPrice?: number

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  maxPrice?: number

  @IsOptional()
  @IsBooleanString()
  inStock?: string

  @IsOptional()
  @IsString()
  sort?: 'popularity' | 'price' | 'new'

  @IsOptional()
  @IsString()
  city?: string

  // Checkbox "Только мой город" on frontend.
  // Stored as boolean string to match query params (?onlyMyCity=true)
  @IsOptional()
  @IsBooleanString()
  onlyMyCity?: string

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number

  // Dynamic specs filtering from UI.
  // JSON string: {"Материал":["Керамика","Пластик"], ...}
  @IsOptional()
  @IsString()
  specs?: string

  // Numeric ranges for specs (slider UI).
  // JSON string: {"Вес":{"min":0.2,"max":1.5}, ...}
  @IsOptional()
  @IsString()
  specRanges?: string
}

export class SearchQueryDto {
  @IsString()
  query!: string

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number

  @IsOptional()
  @IsString()
  city?: string
}

export class SuggestQueryDto {
  @IsString()
  query!: string

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number

  @IsOptional()
  @IsString()
  city?: string
}

// ----------------------
// Admin catalog DTOs (manager)
// ----------------------

export class CreateCategoryDto {
  @IsOptional()
  @IsString()
  slug?: string

  @IsString()
  name!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  imageUrl?: string

  // null/undefined -> root category, number -> subcategory
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number | null

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsBoolean()
  archived?: boolean
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  slug?: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number | null

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsBoolean()
  archived?: boolean
}

export class CreateProductDto {
  // Можно не передавать — будет сгенерирован автоматически (и сделан уникальным)
  @IsOptional()
  @IsString()
  slug?: string

  @IsString()
  name!: string

  // Можно не передавать — будет сгенерирован автоматически по городу (regionCode-0001)
  @IsOptional()
  @IsString()
  article?: string

  // numeric string: keep compatible with existing Product.price string
  @IsNumberString()
  price!: string

  @IsInt()
  @Type(() => Number)
  categoryId!: number

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number

  @IsOptional()
  specs?: Record<string, string>

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean

  // заготовка/готовый товар
  @IsOptional()
  @IsString()
  kind?: 'blank' | 'finished'

  // активен/скрыт
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsBoolean()
  archived?: boolean
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  slug?: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  article?: string

  @IsOptional()
  @IsNumberString()
  price?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number

  @IsOptional()
  specs?: Record<string, string>

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean

  @IsOptional()
  @IsString()
  kind?: 'blank' | 'finished'

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsBoolean()
  archived?: boolean
}

export class CloneProductDto {
  // Which fields to copy from the source product.
  // slug/article are always regenerated and are ignored if passed.
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(
    [
      'name',
      'price',
      'weight',
      'city',
      'categoryId',
      'isAvailable',
      'kind',
      'description',
      'specs',
    ],
    { each: true },
  )
  fields?: string[]

  // Copy image records (same URLs) and preserve sortOrder
  @IsOptional()
  @IsBoolean()
  includeImages?: boolean
}

export class AdminProductsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number

  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  // Filter products by a specific issue (computed server-side)
  // allowed: no_price | no_image | no_category
  @IsOptional()
  @IsString()
  issue?: string

  // Optional filter by city code (e.g. KHV, MSK, etc.)
  @IsOptional()
  @IsString()
  city?: string

  // Optional filter by product kind (blank/finished)
  @IsOptional()
  @IsString()
  @IsIn(['blank', 'finished'])
  kind?: 'blank' | 'finished'

  // Show archived products in admin list (default: false)
  @IsOptional()
  @IsBooleanString()
  showArchived?: string

}

export class BomItemDto {
  @Type(() => Number)
  @IsInt()
  componentProductId!: number

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  qty!: number
}

export class UpdateImageDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number
}
