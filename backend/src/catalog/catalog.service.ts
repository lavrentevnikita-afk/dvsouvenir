import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, ILike, In, IsNull, Repository } from 'typeorm'
import { extname, join } from 'path'
import * as fs from 'fs'
import { Category } from './category.entity'
import { Product } from './product.entity'
import { ProductImage } from './product-image.entity'
import {
  GetProductsQueryDto,
  SearchQueryDto,
  SuggestQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateProductDto,
  UpdateProductDto,
  AdminProductsQueryDto,
  UpdateImageDto,
} from './dto'
import { Stock } from '../b2b/stock.entity'
import { Warehouse } from '../ops/warehouse.entity'
import { ArticleSequence } from './article-sequence.entity'
import { BomItem } from './bom-item.entity'
import { WAREHOUSE_CODES } from '../shared/enums'
// NOTE: images can be stored either in Object Storage (default) or locally via ENABLE_LOCAL_UPLOADS=true
import { ObjectStorageService } from '../storage/object-storage.service'
import { AuditLog } from '../admin-settings/audit-log.entity'
import { User } from '../users/user.entity'
import { City } from './city.entity'
import { StoreProfile } from '../b2b/store-profile.entity'
import { PricingService } from '../shared/pricing/pricing.service'

@Injectable()
export class CatalogService implements OnModuleInit {
    /**
     * Экспорт товаров в CSV для 1С (Windows-1251)
     */
    async exportProductsCsv(query: AdminProductsQueryDto): Promise<Buffer> {
      const { products } = await this.adminListProducts(query)
      // Формируем заголовки CSV
      const headers = ['ID', 'Артикул', 'Название', 'Категория', 'Цена', 'Доступность', 'Количество']
      const rows = [headers]
      for (const p of products) {
        rows.push([
          p.id,
          p.article ?? '',
          p.name ?? '',
          p.category?.name ?? '',
          p.price ?? '',
          p.isAvailable ? 'В наличии' : 'Нет',
          p.stockQty ?? '',
        ].map((v) => String(v).replace(/"/g, '""')))
      }
      // Собираем CSV
      const csvString = rows.map(r => r.map(v => `"${v}"`).join(';')).join('\r\n')
      // Конвертируем в Windows-1251
      const iconv = require('iconv-lite')
      return iconv.encode(csvString, 'win1251')
    }
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imagesRepo: Repository<ProductImage>,
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>,
    @InjectRepository(Warehouse)
    private readonly warehousesRepo: Repository<Warehouse>,
    @InjectRepository(ArticleSequence)
    private readonly sequencesRepo: Repository<ArticleSequence>,
    @InjectRepository(BomItem)
    private readonly bomRepo: Repository<BomItem>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(City)
    private readonly citiesRepo: Repository<City>,
    @InjectRepository(StoreProfile)
    private readonly storeProfilesRepo: Repository<StoreProfile>,
    private readonly dataSource: DataSource,
    private readonly objectStorage: ObjectStorageService,
    private readonly pricing: PricingService,
  ) {}

  private async getDiscountPercentForUser(user?: any | null): Promise<number> {
    if (!user || user?.role !== 'store') return 0
    const profile = await this.storeProfilesRepo.findOne({ where: { user: { id: user.id } } })
    const dp = Number((profile as any)?.discountPercent ?? 0)
    if (!Number.isFinite(dp)) return 0
    return Math.max(0, Math.min(100, Math.round(dp)))
  }

  // ----- Этап B: «Stock всегда существует» -----

  private async ensureWarehouseCode(code: string): Promise<Warehouse> {
    const c = String(code).trim().toUpperCase()

    // TypeORM returns Entity | null; we keep the explicit typing to avoid TS overload confusion.
    let wh: Warehouse | null = await this.warehousesRepo.findOne({ where: { code: c } as any })

    if (!wh) {
      // Fallback safety — по этапу A эти склады должны быть созданы bootstrap'ом.
      // `create()` has an overload for arrays, so we cast to the entity to prevent TS from inferring Warehouse[].
      wh = this.warehousesRepo.create({
        code: c,
        name: c,
        type: c as any,
        regionCode: '',
      } as any) as unknown as Warehouse
      await this.warehousesRepo.save(wh)
    }

    return wh!
  }

  private async ensureStockRow(product: Product, warehouseCode: string) {
    const wh = String(warehouseCode).trim().toUpperCase()
    // ensure warehouse exists (idempotent)
    await this.ensureWarehouseCode(wh)

    const existing = await this.stockRepo.findOne({ where: { warehouse: wh, product: { id: product.id } } as any })
    if (existing) return existing

    const row = this.stockRepo.create({
      warehouse: wh,
      product,
      qty: 0,
      reservedQty: 0,
      onOrderQty: 0,
      minQty: 0,
    } as any)
    return this.stockRepo.save(row)
  }

  private async writeAudit(
    userId: number | null,
    action: string,
    entity: string | null,
    meta: any,
  ) {
    try {
      const row = this.auditRepo.create({
        userId: userId ?? null,
        action,
        entity,
        meta: meta ?? null,
      })
      await this.auditRepo.save(row)
    } catch {
      // audit logging must never break business logic
    }
  }

  // ----- Этап 3: availabilityStatus + canOrder (витрина) -----
  private async computeAvailabilityForProduct(productId: number, quantity: number): Promise<{
    availabilityStatus: 'expected' | 'preorder' | 'in_stock' | 'low'
    canOrder: boolean
  }> {
    // finished stock
    // Добавляем quantity как параметр
    // quantity теперь приходит как параметр
    const finishedRow = await this.stockRepo.findOne({
      where: { warehouse: WAREHOUSE_CODES.FINISHED, product: { id: productId } } as any,
    })

    const finishedFree = Math.max(0, Number(finishedRow?.qty ?? 0) - Number(finishedRow?.reservedQty ?? 0))

    // blanks availability via BOM (components stored in BLANKS warehouse)
    const bom = await this.bomRepo.find({ where: { productId } as any })

    let possibleFromBlanks = 0
    if (bom.length) {
      possibleFromBlanks = Number.POSITIVE_INFINITY
      for (const item of bom as any[]) {
        const needPerUnit = Math.max(0, Number(item.qty ?? 0))
        if (!needPerUnit) {
          possibleFromBlanks = 0
          break
        }

        const blankRow = await this.stockRepo.findOne({
          where: { warehouse: WAREHOUSE_CODES.BLANKS, product: { id: item.componentProductId } } as any,
        })

        const blankFree = Math.max(0, Number(blankRow?.qty ?? 0) - Number(blankRow?.reservedQty ?? 0))
        const canMake = Math.floor(blankFree / needPerUnit)
        possibleFromBlanks = Math.min(possibleFromBlanks, canMake)
      }

      if (!Number.isFinite(possibleFromBlanks)) possibleFromBlanks = 0
    }

    // Статус и возможность заказа
    const totalAvailable = finishedFree + possibleFromBlanks;
    let availabilityStatus: 'in_stock' | 'low' | 'preorder' | 'expected' = 'expected';
    let canOrder = false;

    if (finishedFree >= 10) {
      availabilityStatus = 'in_stock';
      canOrder = totalAvailable >= quantity;
    } else if (finishedFree > 0 && finishedFree < 10) {
      availabilityStatus = 'low';
      canOrder = totalAvailable >= quantity;
    } else if (possibleFromBlanks > 0) {
      availabilityStatus = 'preorder';
      canOrder = totalAvailable >= quantity;
    } else {
      availabilityStatus = 'expected';
      canOrder = false;
    }

    return { availabilityStatus, canOrder };
  }

  async getCities(): Promise<{ cities: { code: string; name: string; regionCode: string }[] }> {
    // Города — отдельная справочная таблица. Они используются в витрине (выбор города)
    // и в поле product.city (приоритизация/фильтр выдачи).
    const rows = await this.citiesRepo.find({ order: { name: 'ASC', code: 'ASC' } as any })
    return {
      cities: rows.map((c) => ({
        code: String(c.code).toUpperCase(),
        name: String(c.name),
        regionCode: String((c as any).regionCode || ''),
      })),
    }
  }

  async onModuleInit() {
    // Ensure existing categories always have a usable slug
    await this.ensureMissingCategorySlugs()

    // Simple seeding for development: create a couple of categories and products if DB is empty
    const count = await this.categoriesRepo.count()
    if (count > 0) return

    const createRoot = (slug: string, name: string, description?: string) =>
      this.categoriesRepo.create({ slug, name, description: description ?? null, parent: null, sortOrder: 0, isActive: true })

    const souvenirs = createRoot(
      'souvenirs',
      'Сувениры',
      'Классические сувениры для туристов и корпоративных подарков.',
    )
    const gifts = createRoot(
      'gifts',
      'Подарки',
      'Подарки для друзей, коллег и партнёров.',
    )

    // Example hierarchy requested by the client (can be edited/deleted in admin).
    const lighters = createRoot('lighters', 'Зажигалки')
    const magnets = createRoot('magnets', 'Магниты')

    await this.categoriesRepo.save([souvenirs, gifts, lighters, magnets])

    const makeChild = (parent: Category, slug: string, name: string, sortOrder: number) =>
      this.categoriesRepo.create({ slug, name, parent, sortOrder, isActive: true, description: null })

    await this.categoriesRepo.save([
      makeChild(lighters, 'lighters-metal', 'Металл', 1),
      makeChild(lighters, 'lighters-plastic', 'Пластик', 2),
      makeChild(lighters, 'lighters-gift', 'Подарочные', 3),
      makeChild(lighters, 'lighters-tourist', 'Туристические', 4),
      makeChild(lighters, 'lighters-piezo', 'Пьезо', 5),
      makeChild(lighters, 'lighters-gas', 'Газовые', 6),
      makeChild(magnets, 'magnets-plywood', 'Фанера', 1),
      makeChild(magnets, 'magnets-mdf', 'МДФ', 2),
      makeChild(magnets, 'magnets-acrylic', 'Акрил', 3),
      makeChild(magnets, 'magnets-multi', 'Многослойные', 4),
      makeChild(magnets, 'magnets-interactive', 'Интерактивные', 5),
      makeChild(magnets, 'magnets-poured', 'Заливные', 6),
      makeChild(magnets, 'magnets-gypsum', 'Гипсовые', 7),
      makeChild(magnets, 'magnets-volume', 'Объёмные', 8),
    ])

    const products: Product[] = []

    products.push(
      this.productsRepo.create({
        slug: 'magnet-moscow',
        name: 'Магнит «Москва»',
        article: 'SV-0001',
        description: 'Керамический магнит с видом Москвы.',
        specs: {
          Материал: 'Керамика',
          Размер: '7×5 см',
          Упаковка: 'Пакетик'
        },
        price: '350.00',
        isAvailable: true,
        popularity: 10,
        category: souvenirs
      }),
      this.productsRepo.create({
        slug: 'cup-logo',
        name: 'Кружка с логотипом',
        article: 'SV-0002',
        description: 'Белая керамическая кружка с возможностью нанесения логотипа.',
        specs: {
          Материал: 'Керамика',
          Объём: '330 мл',
          Упаковка: 'Картонная коробка'
        },
        price: '590.00',
        isAvailable: true,
        popularity: 25,
        category: gifts
      }),
      this.productsRepo.create({
        slug: 'tshirt-brand',
        name: 'Футболка фирменная',
        article: 'SV-0003',
        description: 'Хлопковая футболка с принтом.',
        specs: {
          Материал: '100% хлопок',
          Размеры: 'S–XL',
          Цвет: 'Белый'
        },
        price: '1290.00',
        isAvailable: false,
        popularity: 5,
        category: gifts
      })
    )

    const savedProducts = await this.productsRepo.save(products)

    const images: ProductImage[] = []

    for (const [index, product] of savedProducts.entries()) {
      images.push(
        this.imagesRepo.create({
          product,
          url: `https://placehold.co/600x400?text=Product+${index + 1}`,
          sortOrder: 0
        })
      )
    }

    await this.imagesRepo.save(images)
  }

  private slugify(input: string) {
    // Keep unicode letters (including Cyrillic) so URLs like /catalog/магниты work.
    // Also keeps numbers. Replaces spaces with hyphens.
    const s = String(input ?? '')
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\p{L}\p{N}-]+/gu, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    return s || 'category'
  }

  private async ensureMissingCategorySlugs() {
    const missing = await this.categoriesRepo.find({ where: { slug: IsNull() } as any })
    if (!missing.length) return

    for (const c of missing) {
      // generate from name, but guarantee uniqueness
      const base = this.slugify(c.name)
      let candidate = base
      let i = 2
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const exists = await this.categoriesRepo.findOne({ where: { slug: candidate } as any })
        if (!exists || exists.id === c.id) break
        candidate = `${base}-${i++}`
      }
      c.slug = candidate
    }
    await this.categoriesRepo.save(missing)
  }

  private safeJson<T>(raw: any, fallback: T): T {
    if (raw == null) return fallback
    if (typeof raw !== 'string') return fallback
    try {
      const parsed = JSON.parse(raw)
      return (parsed ?? fallback) as T
    } catch {
      return fallback
    }
  }

  private applySpecsFilters(qb: any, query: GetProductsQueryDto) {
    const specFilters = this.safeJson<Record<string, string[]>>(query.specs, {})
    const ranges = this.safeJson<Record<string, { min?: number; max?: number }>>(query.specRanges, {})

    let idx = 0
    for (const [key, valuesRaw] of Object.entries(specFilters)) {
      const values = (Array.isArray(valuesRaw) ? valuesRaw : []).map((v) => String(v)).filter(Boolean)
      if (!key || values.length === 0) continue
      idx += 1
      qb.andWhere(`(product.specs ->> :specKey_${idx}) IN (:...specVals_${idx})`, {
        [`specKey_${idx}`]: key,
        [`specVals_${idx}`]: values,
      })
    }

    for (const [key, r] of Object.entries(ranges)) {
      const min = r?.min
      const max = r?.max
      if (!key || (min == null && max == null)) continue
      idx += 1
      // Store specs as strings, so cast to numeric where possible.
      // Non-numeric values will become NULL and won't pass the comparisons.
      const expr = `NULLIF(regexp_replace(product.specs ->> :rangeKey_${idx}, '[^0-9\\.,-]+', '', 'g'), '')::numeric`
      qb.setParameter(`rangeKey_${idx}`, key)
      if (typeof min === 'number' && Number.isFinite(min)) {
        qb.andWhere(`${expr} >= :rangeMin_${idx}`, { [`rangeMin_${idx}`]: min })
      }
      if (typeof max === 'number' && Number.isFinite(max)) {
        qb.andWhere(`${expr} <= :rangeMax_${idx}`, { [`rangeMax_${idx}`]: max })
      }
    }
  }

  /**
   * Public categories tree:
   * returns only root categories (parent IS NULL) and their children.
   */
  async getCategoriesTree() {
    const categories = await this.categoriesRepo.find({
      where: { parent: IsNull(), isActive: true } as any,
      relations: ['children'],
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
        children: {
          sortOrder: 'ASC',
          name: 'ASC',
        },
      } as any,
    })

    // hide inactive children without extra queries
    for (const c of categories as any[]) {
      c.children = (c.children || []).filter((x: any) => x.isActive !== false)
    }

    // Attach product counts per category (used by header + /catalog page UI)
    // IMPORTANT: counts must include products from nested descendants (not only direct children).
    const catRows = await this.categoriesRepo
      .createQueryBuilder('c')
      .select('c.id', 'id')
      .addSelect('"c"."parent_id"', 'parentId')
      .where('c.isActive = true')
      .getRawMany<{ id: number; parentId: number | null }>()

    const childrenByParent = new Map<number, number[]>()
    for (const r of catRows) {
      const p = r.parentId == null ? 0 : Number(r.parentId)
      const arr = childrenByParent.get(p) ?? []
      arr.push(Number(r.id))
      childrenByParent.set(p, arr)
    }

    const allCatIds = catRows.map((r) => Number(r.id))
    const directCounts = new Map<number, number>()
    if (allCatIds.length) {
      const rows = await this.productsRepo
        .createQueryBuilder('p')
        .select('p.categoryId', 'categoryId')
        .addSelect('COUNT(*)', 'cnt')
        .where('p.categoryId IN (:...ids)', { ids: allCatIds })
        .groupBy('p.categoryId')
        .getRawMany<{ categoryId: string; cnt: string }>()
      for (const r of rows) directCounts.set(Number(r.categoryId), Number(r.cnt))
    }

    const totalCountMemo = new Map<number, number>()
    const computeTotal = (id: number): number => {
      const cached = totalCountMemo.get(id)
      if (cached != null) return cached
      let total = directCounts.get(id) ?? 0
      const kids = childrenByParent.get(id) ?? []
      for (const kid of kids) total += computeTotal(kid)
      totalCountMemo.set(id, total)
      return total
    }

    for (const root of categories as any[]) {
      root.productsCount = computeTotal(root.id)
      for (const ch of (root.children || [])) {
        ch.productsCount = computeTotal(ch.id)
      }
    }

    return { categories }
  }

  /**
   * Public: category details + breadcrumb chain.
   * Breadcrumbs: [root ... current]
   */
  async getCategoryBySlug(slugRaw: string) {
    const slug = String(slugRaw || '').trim()
    const cat = await this.categoriesRepo.findOne({
      where: { slug } as any,
      relations: ['parent', 'children'],
    })

    if (!cat) {
      throw new NotFoundException('Category not found')
    }

    // Walk parents to root (no depth limit)
    const chain: Category[] = []
    let cur: Category | null = cat
    while (cur) {
      chain.push(cur)
      if (!cur.parent) break
      // eslint-disable-next-line no-await-in-loop
      cur = await this.categoriesRepo.findOne({ where: { id: cur.parent.id } as any, relations: ['parent'] })
    }

    const breadcrumbs = chain
      .reverse()
      .map((c) => ({ id: c.id, name: c.name, slug: c.slug }))

    // If root category – include children with product counts (+ optional preview image).
    let children: Array<{ id: number; name: string; slug: string | null; productsCount: number; previewImageUrl?: string | null }> = []
    if (!cat.parent && Array.isArray((cat as any).children) && (cat as any).children.length) {
      // Counts must include nested descendants.
      const catRows = await this.categoriesRepo
        .createQueryBuilder('c')
        .select('c.id', 'id')
        .addSelect('"c"."parent_id"', 'parentId')
        .where('c.isActive = true')
        .getRawMany<{ id: number; parentId: number | null }>()

      const childrenByParent = new Map<number, number[]>()
      for (const r of catRows) {
        const p = r.parentId == null ? 0 : Number(r.parentId)
        const arr = childrenByParent.get(p) ?? []
        arr.push(Number(r.id))
        childrenByParent.set(p, arr)
      }

      const allCatIds = catRows.map((r) => Number(r.id))
      const directCounts = new Map<number, number>()
      if (allCatIds.length) {
        const rows = await this.productsRepo
          .createQueryBuilder('p')
          .select('p.categoryId', 'categoryId')
          .addSelect('COUNT(*)', 'cnt')
          .where('p.categoryId IN (:...ids)', { ids: allCatIds })
          .groupBy('p.categoryId')
          .getRawMany<{ categoryId: string; cnt: string }>()
        for (const r of rows) directCounts.set(Number(r.categoryId), Number(r.cnt))
      }

      const totalCountMemo = new Map<number, number>()
      const computeTotal = (id: number): number => {
        const cached = totalCountMemo.get(id)
        if (cached != null) return cached
        let total = directCounts.get(id) ?? 0
        const kids = childrenByParent.get(id) ?? []
        for (const kid of kids) total += computeTotal(kid)
        totalCountMemo.set(id, total)
        return total
      }

      // Preview images (best-effort): take first product image from each child category.
      const preview = new Map<number, string | null>()
      for (const child of (cat as any).children as Category[]) {
        // eslint-disable-next-line no-await-in-loop
        const p = await this.productsRepo.findOne({
          where: { category: { id: child.id } } as any,
          relations: ['images'],
          order: { id: 'DESC' } as any,
        })
        const img = (p as any)?.images?.[0]?.url ?? (p as any)?.images?.[0]?.imageUrl ?? null
        preview.set(child.id, img)
      }

      children = (cat as any).children
        .slice()
        .sort((a: Category, b: Category) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name))
        .map((c: Category) => ({
          id: c.id,
          name: c.name,
          slug: (c as any).slug ?? null,
          productsCount: computeTotal(c.id),
          previewImageUrl: preview.get(c.id) ?? null,
        }))
    }

    return {
      category: { id: cat.id, name: cat.name, slug: cat.slug, parentId: cat.parent ? cat.parent.id : null },
      breadcrumbs,
      children,
    }
  }

  /**
   * Admin list: flat categories with parent relation.
   * (UI can build tree/indentation on its side)
   */
  async adminGetCategories() {
    const categories = await this.categoriesRepo.find({
      relations: ['parent'],
      order: { sortOrder: 'ASC', name: 'ASC', id: 'ASC' } as any,
    })
    return { categories }
  }

  async getProducts(query: GetProductsQueryDto, user?: any | null) {
    const qb = this.productsRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')

    // скрытые товары не показываем в витрине
    qb.andWhere('product.isActive = true')
    qb.andWhere('product.archived = false')

    // Guardrail: подсказки поиска только по готовым товарам.
    qb.andWhere("product.kind = 'finished'")

    // Guardrail: заготовки (blank) никогда не попадают в публичный каталог.
    // Даже если кто-то забудет фильтр на уровне контроллера/клиента — SQL всё равно отсечёт их.
    qb.andWhere("product.kind = 'finished'")

    // Город в шапке влияет на выдачу ВСЕГДА:
    // - по умолчанию: просто приоритизируем товары выбранного города
    // - если включён onlyMyCity: фильтруем только выбранный город
    if (query.city) {
      qb.setParameter('city', query.city)
      qb.addSelect('CASE WHEN product.city = :city THEN 1 ELSE 0 END', 'citymatch')

      // Приоритизация: сначала товары выбранного города.
      // Остатки ведём на «жёстких» складах (FINISHED/BLANKS/DEFECT), поэтому городской stock больше не участвует.
      qb.orderBy('citymatch', 'DESC')

      if (query.onlyMyCity === 'true') {
        qb.andWhere('product.city = :city')
      }
    }

    if (query.category) {
      const slug = String(query.category).trim()
      const cat = await this.categoriesRepo.findOne({
        where: { slug } as any,
        relations: ['children', 'parent'],
      })
      if (cat) {
        // Категория может быть родительской (в т.ч. с несколькими уровнями вложенности).
        // В таком случае показываем товары из ВСЕХ потомков, а не только из прямых детей.
        const collectDescendantIds = async (rootId: number) => {
          const ids = new Set<number>([rootId])
          let frontier: number[] = [rootId]
          while (frontier.length) {
            // parentId колонка есть в таблице categories (обычная adjacency list)
            const rows: Array<{ id: number }> = await this.categoriesRepo
              .createQueryBuilder('c')
              // IMPORTANT: our DB column is `parent_id` (snake_case). Using `c.parentId` as a raw
              // SQL identifier produces `c.parentId` in SQL and fails on Postgres.
              // We select an explicit alias to keep raw mapping stable.
              .select('c.id', 'id')
              .where('"c"."parent_id" IN (:...pids)', { pids: frontier })
              .getRawMany()

            const next: number[] = []
            for (const r of rows) {
              const cid = Number((r as any).id)
              if (cid && !ids.has(cid)) {
                ids.add(cid)
                next.push(cid)
              }
            }
            frontier = next
          }
          return Array.from(ids)
        }

        const ids = (cat.children?.length ? await collectDescendantIds(cat.id) : [cat.id])
        qb.andWhere('category.id IN (:...ids)', { ids })
      } else {
        // fallback: keep old behaviour
        qb.andWhere('category.slug = :slug', { slug })
      }
    }

    if (typeof query.minPrice === 'number') {
      qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice })
    }

    if (typeof query.maxPrice === 'number') {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice })
    }

    if (query.inStock === 'true') {
      qb.andWhere('product.isAvailable = true')
    }

    // Dynamic specs filters (left sidebar UI)
    this.applySpecsFilters(qb, query)

    // Sorting (если город задал первичный порядок — добавляем как вторичный)
    // Если города нет — сортировка становится основной.
    const hasCitySort = !!query.city
    const order = (col: string, dir: 'ASC' | 'DESC') =>
      hasCitySort ? qb.addOrderBy(col, dir) : qb.orderBy(col, dir)

    switch (query.sort) {
      case 'price':
        order('product.price', 'ASC')
        break
      case 'new':
        order('product.createdAt', 'DESC')
        break
      case 'popularity':
      default:
        order('product.popularity', 'DESC')
        break
    }

    const limit = query.limit ?? 24
    const page = query.page ?? 1
    qb.take(limit).skip((page - 1) * limit)

    const [items, total] = await qb.getManyAndCount()

    // Раньше тут была «приоритизация» по городу в JS.
    // Теперь по требованию — именно фильтрация на уровне SQL (см. выше).

    for (const p of items as any[]) {
      const retailRaw = Number(p.price)
      const retailRounded = Number.isFinite(retailRaw) ? Math.round(retailRaw) : 0
      p.retailPrice = retailRounded
      p.priceInfo = { retail: retailRounded, discountPercent: 0, discount: 0, final: retailRounded }
      p.wholesalePrice = retailRounded
      p.price = retailRounded
    }

    return {
      total,
      page,
      limit,
      products: items
    }
  }

  /**
   * Facets for catalog: build available specs (enum values) and numeric ranges.
   * This endpoint is meant for the left filters sidebar UI.
   */
  async getFilters(query: GetProductsQueryDto) {
    const qb = this.productsRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')

    qb.andWhere('product.isActive = true')
    qb.andWhere('product.archived = false')

    // Guardrail: заготовки (blank) не участвуют в публичных фильтрах.
    qb.andWhere("product.kind = 'finished'")

    // Reuse base filters (category/city/onlyMyCity/price/inStock), but DO NOT apply specs filters
    // so the UI can show full available range in the current category.
    if (query.city) {
      qb.setParameter('city', query.city)
      if (query.onlyMyCity === 'true') {
        qb.andWhere('product.city = :city')
      }
    }

    if (query.category) {
      const slug = String(query.category).trim()
      const cat = await this.categoriesRepo.findOne({ where: { slug } as any, relations: ['children', 'parent'] })
      if (cat) {
        if (!cat.parent) {
          const ids = [cat.id, ...((cat.children || []).map((c) => c.id))]
          qb.andWhere('category.id IN (:...ids)', { ids })
        } else {
          qb.andWhere('category.id = :cid', { cid: cat.id })
        }
      } else {
        qb.andWhere('category.slug = :slug', { slug })
      }
    }

    if (typeof query.minPrice === 'number') qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice })
    if (typeof query.maxPrice === 'number') qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice })
    if (query.inStock === 'true') qb.andWhere('product.isAvailable = true')

    // Pull only fields we need
    qb.select(['product.id', 'product.specs'])

    // Safety cap for facets: enough for UI, avoids heavy scans on big catalogs
    qb.take(3000)

    const items = await qb.getMany()

    const buckets = new Map<string, { values: Map<string, number>; nums: number[] }>()

    const extractNumber = (v: any): number | null => {
      if (v == null) return null
      const s = String(v).replace(',', '.')
      const m = s.match(/-?\d+(?:\.\d+)?/)
      if (!m) return null
      const n = Number(m[0])
      return Number.isFinite(n) ? n : null
    }

    for (const p of items as any[]) {
      const specs = p?.specs
      if (!specs || typeof specs !== 'object') continue
      for (const [k, raw] of Object.entries(specs)) {
        const key = String(k).trim()
        if (!key) continue
        const val = raw == null ? '' : String(raw).trim()
        if (!val) continue

        if (!buckets.has(key)) buckets.set(key, { values: new Map(), nums: [] })
        const b = buckets.get(key)!
        b.values.set(val, (b.values.get(val) || 0) + 1)
        const num = extractNumber(val)
        if (num != null) b.nums.push(num)
      }
    }

    const specs: Record<
      string,
      | { type: 'enum'; values: { value: string; count: number }[] }
      | { type: 'range'; min: number; max: number; step: number }
    > = {}

    const niceStep = (min: number, max: number) => {
      const span = Math.abs(max - min)
      if (span <= 1) return 0.01
      if (span <= 10) return 0.1
      if (span <= 100) return 1
      if (span <= 500) return 5
      return 10
    }

    for (const [key, b] of buckets.entries()) {
      const uniq = [...b.values.entries()].sort((a, c) => c[1] - a[1]).slice(0, 80)
      const numericRatio = b.nums.length / Math.max(1, [...b.values.keys()].length)
      const min = b.nums.length ? Math.min(...b.nums) : NaN
      const max = b.nums.length ? Math.max(...b.nums) : NaN

      // Heuristic:
      // - show slider only if values look numeric and there's a meaningful spread
      // - otherwise show enum checkboxes
      if (Number.isFinite(min) && Number.isFinite(max) && max > min && numericRatio >= 0.6) {
        specs[key] = { type: 'range', min, max, step: niceStep(min, max) }
      } else {
        specs[key] = { type: 'enum', values: uniq.map(([value, count]) => ({ value, count })) }
      }
    }

    return { specs }
  }

  async getProduct(id: number, user?: any | null) {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: ['category', 'images']
    })

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    if ((product as any).isActive === false) {
      throw new NotFoundException('Product not found')
    }

    // Guardrail: заготовки (blank) не должны быть доступны через публичное API (карточка по прямой ссылке -> 404).
    if ((product as any).kind !== 'finished') {
      throw new NotFoundException('Product not found')
    }

    // Server-calculated pricing. Keep legacy fields (retailPrice/wholesalePrice) for UI compatibility.
    const discountPercent = await this.getDiscountPercentForUser(user)
    const isStore = Boolean(user && user?.role === 'store')
    const wholesaleCoef = Number(process.env.WHOLESALE_COEF ?? '0.85')

    const retailRaw = Number((product as any).price)
    const retailRounded = Number.isFinite(retailRaw) ? Math.round(retailRaw) : 0
    ;(product as any).price = retailRounded
    ;(product as any).retailPrice = retailRounded

    if (isStore) {
      const pb = this.pricing.getPriceForContext(product as any, { discountPercent })
      ;(product as any).priceInfo = pb
      ;(product as any).wholesalePrice = pb.final
    } else {
      const approx = Math.round(retailRounded * wholesaleCoef)
      ;(product as any).priceInfo = { retail: retailRounded, discountPercent: 0, discount: 0, final: retailRounded }
      ;(product as any).wholesalePrice = approx
    }

    // Для карточки товара quantity = 1
    const availability = await this.computeAvailabilityForProduct(product.id, 1)
    ;(product as any).availabilityStatus = availability.availabilityStatus
    ;(product as any).canOrder = availability.canOrder

    return { product }
  }

  async search(query: SearchQueryDto, user?: any | null) {
    const limit = query.limit ?? 20
    const q = query.query.trim()

    if (!q) {
      return { products: [] }
    }

    const qb = this.productsRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.isActive = true')
      .andWhere('product.archived = false')
      .andWhere("product.kind = 'finished'")
      .andWhere('product.name ILIKE :q OR product.article ILIKE :q', { q: `%${q}%` })
      .take(limit)

    if (query.city) {
      qb.setParameter('city', query.city)
      qb.leftJoin(
        'stocks',
        'cityStock',
        'cityStock.productId = product.id AND cityStock.warehouse = :city',
      )
      qb.addSelect('COALESCE(cityStock.qty, 0)', 'cityqty')
      // Аналогично каталогу: учитываем товары, которые "привязаны" к городу через product.city,
      // даже если для них ещё не заведены строки в stocks.
      qb.andWhere('(product.city = :city OR COALESCE(cityStock.qty, 0) > 0)')
      qb.addOrderBy('cityqty', 'DESC')
    }

    qb.addOrderBy('product.popularity', 'DESC')

    const products = await qb.getMany()

    const discountPercent = await this.getDiscountPercentForUser(user)
    const isStore = Boolean(user && user?.role === 'store')
    const wholesaleCoef = Number(process.env.WHOLESALE_COEF ?? '0.85')
    for (const p of products as any[]) {
      const retailRaw = Number(p.price)
      const retailRounded = Number.isFinite(retailRaw) ? Math.round(retailRaw) : 0
      p.price = retailRounded
      p.retailPrice = retailRounded
      if (isStore) {
        const pb = this.pricing.getPriceForContext(p, { discountPercent })
        p.priceInfo = pb
        p.wholesalePrice = pb.final
      } else {
        const approx = Math.round(retailRounded * wholesaleCoef)
        p.priceInfo = { retail: retailRounded, discountPercent: 0, discount: 0, final: retailRounded }
        p.wholesalePrice = approx
      }
    }

    return { products }
  }

  private normalizeQuery(input: string) {
    return input
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/["'`]+/g, '')
      .trim()
  }

  private swapKeyboardLayout(input: string) {
    // Basic EN<->RU QWERTY swap, helps with "vbhf" -> "мир" type queries.
    const en = "`qwertyuiop[]asdfghjkl;'zxcvbnm,.~@#$^&".split('')
    const ru = "ёйцукенгшщзхъфывапролджэячсмитьбю.Ё\"№;:?".split('')
    const mapEnToRu = new Map(en.map((c, i) => [c, ru[i] ?? c]))
    const mapRuToEn = new Map(ru.map((c, i) => [c, en[i] ?? c]))
    const hasRu = /[а-яё]/i.test(input)
    const hasEn = /[a-z]/i.test(input)
    const map = hasEn && !hasRu ? mapEnToRu : hasRu && !hasEn ? mapRuToEn : null
    if (!map) return input
    return input
      .split('')
      .map((ch) => map.get(ch) ?? map.get(ch.toLowerCase()) ?? ch)
      .join('')
  }

  private async fetchProductSuggestions(q: string, limit: number, city?: string) {
    const qb = this.productsRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')

    qb.andWhere('product.isActive = true')
    qb.andWhere('product.archived = false')

    // Guardrail: подсказки только для finished товаров.
    qb.andWhere("product.kind = 'finished'")

    // Score: prefix match > contains match > article match
    qb.setParameter('qPrefix', `${q}%`)
    qb.setParameter('qContains', `%${q}%`)
    qb.addSelect(
      `CASE
        WHEN product.name ILIKE :qPrefix THEN 3
        WHEN product.article ILIKE :qPrefix THEN 3
        WHEN product.name ILIKE :qContains THEN 2
        WHEN product.article ILIKE :qContains THEN 2
        ELSE 0
      END`,
      'rank',
    )
    qb.where('product.name ILIKE :qContains OR product.article ILIKE :qContains')

    if (city) {
      qb.setParameter('city', city)
      qb.leftJoin(
        'stocks',
        'cityStock',
        'cityStock.productId = product.id AND cityStock.warehouse = :city',
      )
      qb.addSelect('COALESCE(cityStock.qty, 0)', 'cityqty')
      qb.andWhere('(product.city = :city OR COALESCE(cityStock.qty, 0) > 0)')
      qb.addOrderBy('cityqty', 'DESC')
    }

    qb.addOrderBy('rank', 'DESC')
    qb.addOrderBy('product.popularity', 'DESC')
    qb.take(limit)

    const products = await qb.getMany()

    const wholesaleCoef = Number(process.env.WHOLESALE_COEF ?? '0.85')
    for (const p of products as any[]) {
      const retail = Number(p.price)
      p.retailPrice = p.price
      if (Number.isFinite(retail)) {
        p.wholesalePrice = (retail * wholesaleCoef).toFixed(2)
      } else {
        p.wholesalePrice = p.price
      }
    }

    return products
  }

  private async fetchCategorySuggestions(q: string, limit: number) {
    const qb = this.categoriesRepo.createQueryBuilder('category')
    qb.setParameter('qPrefix', `${q}%`)
    qb.setParameter('qContains', `%${q}%`)
    qb.addSelect(
      `CASE
        WHEN category.name ILIKE :qPrefix THEN 3
        WHEN category.slug ILIKE :qPrefix THEN 3
        WHEN category.name ILIKE :qContains THEN 2
        WHEN category.slug ILIKE :qContains THEN 2
        ELSE 0
      END`,
      'rank',
    )
    qb.where('category.name ILIKE :qContains OR category.slug ILIKE :qContains')
    qb.andWhere('category.isActive = true')
    qb.addOrderBy('rank', 'DESC')
    qb.addOrderBy('category.sortOrder', 'ASC')
    qb.take(limit)
    return qb.getMany()
  }

  async suggest(query: SuggestQueryDto, user?: any | null) {
    const limit = query.limit ?? 8
    const raw = String(query.query ?? '')
    const q0 = this.normalizeQuery(raw)

    if (!q0) {
      return { products: [], categories: [], correctedQuery: null }
    }

    // Try original query, then keyboard-layout swapped variant.
    const qSwap = this.normalizeQuery(this.swapKeyboardLayout(q0))
    const variants = Array.from(new Set([q0, qSwap].filter(Boolean)))

    let products: any[] = []
    let categories: any[] = []
    let used: string | null = null

    for (const v of variants) {
      products = await this.fetchProductSuggestions(v, limit, query.city)
      categories = await this.fetchCategorySuggestions(v, 5)
      if (products.length || categories.length) {
        used = v
        break
      }
    }

    // De-dup products by id if we ever expand variants in the future
    const seen = new Set<number>()
    products = products.filter((p) => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })

    // Attach unified server-side pricing
    const discountPercent = await this.getDiscountPercentForUser(user)
    const isStore = Boolean(user && user?.role === 'store')
    const wholesaleCoef = Number(process.env.WHOLESALE_COEF ?? '0.85')
    for (const p of products as any[]) {
      const retailRaw = Number(p.price)
      const retailRounded = Number.isFinite(retailRaw) ? Math.round(retailRaw) : 0
      p.price = retailRounded
      p.retailPrice = retailRounded
      if (isStore) {
        const pb = this.pricing.getPriceForContext(p, { discountPercent })
        p.priceInfo = pb
        p.wholesalePrice = pb.final
      } else {
        const approx = Math.round(retailRounded * wholesaleCoef)
        p.priceInfo = { retail: retailRounded, discountPercent: 0, discount: 0, final: retailRounded }
        p.wholesalePrice = approx
      }
    }

    return {
      products,
      categories,
      correctedQuery: used && used !== q0 ? used : null,
    }
  }

  // ----------------------
  // Admin catalog (manager)
  // ----------------------

  async createCategory(dto: CreateCategoryDto) {
    const baseSlug = String(dto.slug || '').trim() || this.slugify(dto.name)

    // Ensure unique slug
    let slug = baseSlug
    let i = 2
    while (await this.categoriesRepo.findOne({ where: { slug } as any })) {
      slug = `${baseSlug}-${i++}`
    }

    let parent: Category | null = null
    if (dto.parentId !== undefined && dto.parentId !== null) {
      parent = await this.categoriesRepo.findOne({ where: { id: dto.parentId } })
      if (!parent) throw new NotFoundException('Parent category not found')
    }

    const category = this.categoriesRepo.create({
      slug,
      name: dto.name,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl ?? null,
      parent,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    })
    await this.categoriesRepo.save(category)
    return { category }
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    const category = await this.categoriesRepo.findOne({ where: { id } })
    if (!category) throw new NotFoundException('Category not found')

    if (typeof dto.slug === 'string') {
      const next = dto.slug.trim() || this.slugify(dto.name ?? category.name)
      category.slug = next
    }
    if (typeof dto.name === 'string') category.name = dto.name
    if (dto.description !== undefined) category.description = dto.description ?? null
    if (dto.imageUrl !== undefined) category.imageUrl = dto.imageUrl ?? null
    if (dto.imageUrl !== undefined) category.imageUrl = dto.imageUrl ?? null

    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        category.parent = null
      } else {
        const parent = await this.categoriesRepo.findOne({ where: { id: dto.parentId } })
        if (!parent) throw new NotFoundException('Parent category not found')
        // prevent self-parenting
        if (parent.id === category.id) {
          throw new BadRequestException('Category cannot be parent of itself')
        }
        category.parent = parent
      }
    }

    if (dto.sortOrder !== undefined) category.sortOrder = Number(dto.sortOrder) || 0
    if (dto.isActive !== undefined) category.isActive = !!dto.isActive

    // If slug is still empty/null (legacy), generate it
    if (!category.slug) {
      const base = this.slugify(category.name)
      let slug = base
      let i = 2
      while (await this.categoriesRepo.findOne({ where: { slug } as any })) {
        slug = `${base}-${i++}`
      }
      category.slug = slug
    }

    await this.categoriesRepo.save(category)
    return { category }
  }

  async deleteCategory(id: number) {
    const category = await this.categoriesRepo.findOne({ where: { id } })
    if (!category) throw new NotFoundException('Category not found')

    // Не удаляем, если есть товары — чтобы случайно не «сломать» каталог.
    const productsCount = await this.productsRepo.count({ where: { category: { id } as any } })
    if (productsCount > 0) {
      return {
        ok: false,
        message: 'Нельзя удалить категорию с товарами. Сначала перенесите товары или удалите их.',
      }
    }

    await this.categoriesRepo.remove(category)
    return { ok: true }
  }

  async adminListProducts(query: AdminProductsQueryDto) {
    const qb = this.productsRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')

const showArchived = String((query as any).showArchived || '').toLowerCase()
if (!(showArchived === 'true' || showArchived === '1')) {
  qb.andWhere('product.archived = false')
}


    if (query.kind) {
      qb.andWhere('product.kind = :kind', { kind: query.kind })
    }

    if (query.city) {
      const city = String(query.city).trim().toUpperCase()
      if (city) qb.andWhere('product.city = :city', { city })
    }

    // Optional: filter by computed issues
    if (query.issue) {
      const issue = String(query.issue).trim()
      if (issue === 'no_price') {
        qb.andWhere('(product.price IS NULL OR product.price::numeric <= 0)')
      } else if (issue === 'no_image') {
        // left join ensures images.id is NULL when there are no images
        qb.andWhere('images.id IS NULL')
      } else if (issue === 'no_category') {
        qb.andWhere('product.categoryId IS NULL')
      }
    }

    if (query.categoryId) {
      const cid = Number(query.categoryId)
      const cat = await this.categoriesRepo.findOne({ where: { id: cid } as any, relations: ['children', 'parent'] })
      if (cat && !cat.parent) {
        const ids = [cat.id, ...((cat.children || []).map((c) => c.id))]
        qb.andWhere('category.id IN (:...cids)', { cids: ids })
      } else {
        qb.andWhere('category.id = :cid', { cid })
      }
    }

    if (query.q) {
      const q = String(query.q).trim()
      if (q) {
        qb.andWhere(
          '(product.name ILIKE :q OR product.article ILIKE :q OR product.slug ILIKE :q)',
          { q: `%${q}%` },
        )
      }
    }

    qb.orderBy('product.id', 'DESC')

    const limit = query.limit ?? 50
    const page = query.page ?? 1
    qb.take(limit).skip((page - 1) * limit)

    const [items, total] = await qb.getManyAndCount()
    // attach stock qty for finished goods (sum across warehouses)
    const ids = items.map((p) => p.id).filter(Boolean)
    let stockMap: Record<number, number> = {}
    if (ids.length) {
      const rows = await this.stockRepo
        .createQueryBuilder('s')
        .select('s.productId', 'productId')
        .addSelect('SUM(s.qty)', 'qty')
        .where('s.productId IN (:...ids)', { ids })
        .groupBy('s.productId')
        .getRawMany()
      stockMap = {}
      for (const r of rows) {
        const pid = Number(r.productId)
        stockMap[pid] = Number(r.qty) || 0
      }
    }
    // Attach BOM presence for finished products
    let bomCountMap: Record<number, number> = {}
    if (ids.length) {
      const rows = await this.bomRepo
        .createQueryBuilder('b')
        .select('b.productId', 'productId')
        .addSelect('COUNT(1)', 'cnt')
        .where('b.productId IN (:...ids)', { ids })
        .groupBy('b.productId')
        .getRawMany()
      for (const r of rows) {
        bomCountMap[Number(r.productId)] = Number(r.cnt) || 0
      }
    }

    const products = items.map((p: any) => {
      const issues: string[] = []
      const priceNum = Number(p.price)
      if (!p.price || Number.isNaN(priceNum) || priceNum <= 0) issues.push('no_price')
      if (!p.images || !Array.isArray(p.images) || p.images.length === 0) issues.push('no_image')
      if (!p.category || !p.category?.id) issues.push('no_category')
      const hasBom = p.kind === 'finished' ? (bomCountMap[p.id] ?? 0) > 0 : false
      return { ...p, stockQty: stockMap[p.id] ?? 0, issues, hasBom }
    })
    return { total, page, limit, products }
  }

  // ----------------------
  // BOM (recipe) for production
  // ----------------------

  async adminGetProductBom(productId: number) {
    const product = await this.productsRepo.findOne({ where: { id: productId } as any })
    if (!product) throw new NotFoundException('Товар не найден')

    const items = await this.bomRepo.find({
      where: { productId } as any,
      order: { id: 'ASC' } as any,
    })

    return {
      productId,
      hasBom: items.length > 0,
      items: items.map((x: any) => ({
        id: x.id,
        componentProductId: x.componentProductId,
        qty: Number(x.qty),
        component: x.componentProduct
          ? {
              id: x.componentProduct.id,
              name: x.componentProduct.name,
              article: x.componentProduct.article,
              slug: x.componentProduct.slug,
              kind: x.componentProduct.kind,
            }
          : null,
      })),
    }
  }

  async adminReplaceProductBom(productId: number, items: Array<{ componentProductId: number; qty: number }>, userId: number | null) {
    const product = await this.productsRepo.findOne({ where: { id: productId } as any })
    if (!product) throw new NotFoundException('Товар не найден')

    if (product.kind !== 'finished') {
      throw new BadRequestException('BOM можно задавать только для готового товара (finished)')
    }

    const normalized = (items || []).map((i) => ({
      componentProductId: Number(i.componentProductId),
      qty: Number(i.qty ?? 1),
    }))

    // Validate payload
    const seen = new Set<number>()
    for (const i of normalized) {
      if (!Number.isInteger(i.componentProductId) || i.componentProductId <= 0) {
        throw new BadRequestException('Некорректный componentProductId')
      }
      if (!Number.isFinite(i.qty) || i.qty <= 0) {
        throw new BadRequestException('qty должно быть больше 0')
      }
      if (seen.has(i.componentProductId)) {
        throw new BadRequestException('В рецепте не должно быть дубликатов заготовок')
      }
      seen.add(i.componentProductId)
    }

    // Components must exist and be blanks
    if (normalized.length) {
      const ids = normalized.map((x) => x.componentProductId)
      const comps = await this.productsRepo.find({ where: { id: In(ids) } as any })
      const byId: Record<number, any> = {}
      for (const c of comps as any[]) byId[c.id] = c
      for (const id of ids) {
        const c = byId[id]
        if (!c) throw new BadRequestException(`Заготовка (productId=${id}) не найдена`)
        if (c.kind !== 'blank') throw new BadRequestException(`Товар (productId=${id}) не является заготовкой (blank)`)
      }
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(BomItem).delete({ productId } as any)

      if (normalized.length) {
        const rows = normalized.map((x) =>
          manager.getRepository(BomItem).create({
            productId,
            componentProductId: x.componentProductId,
            qty: String(x.qty),
          }),
        )
        await manager.getRepository(BomItem).save(rows)
      }
    })

    await this.writeAudit(userId, 'product.bom.replace', 'product', { productId, items: normalized })
    return this.adminGetProductBom(productId)
  }

  private formatArticle(regionCode: string, n: number) {
    const rc = String(regionCode ?? '').trim() || '00'
    const num = String(Math.max(0, Number(n) || 0)).padStart(4, '0')
    return `${rc}-${num}`
  }

  private async makeUniqueProductSlug(base: string, excludeId?: number): Promise<string> {
    const raw = String(base || '').trim()
    const baseSlug = raw || 'product'

    const exists = async (slug: string) => {
      const qb = this.productsRepo
        .createQueryBuilder('p')
        .select('p.id')
        .where('p.slug = :slug', { slug })
        .limit(1)
      if (excludeId) qb.andWhere('p.id != :id', { id: excludeId })
      const found = await qb.getOne()
      return !!found
    }

    if (!(await exists(baseSlug))) return baseSlug

    let i = 2
    while (i < 10_000) {
      const candidate = `${baseSlug}-${i}`
      if (!(await exists(candidate))) return candidate
      i++
    }

    // fallback — очень маловероятно, но пусть будет
    return `${baseSlug}-${Date.now()}`
  }

  private async resolveRegionCodeByCityCode(cityCode?: string | null, manager?: any): Promise<string> {
    const city = String(cityCode || '').trim().toUpperCase()
    if (!city) return ''

    // Primary source of truth: справочник городов
    const cityRepo = manager ? manager.getRepository(City) : this.citiesRepo
    const cityRow = await cityRepo.findOne({ where: { code: city } as any })
    if (cityRow && String((cityRow as any).regionCode || '').trim()) {
      return String((cityRow as any).regionCode).trim()
    }

    // Fallback for legacy setups where city code == warehouse code
    const whRepo = manager ? manager.getRepository(Warehouse) : this.warehousesRepo
    const warehouse = await whRepo.findOne({ where: { code: city } as any })
    return String((warehouse as any)?.regionCode || '').trim()
  }

  /**
   * Возвращает следующий артикул для выбранного города БЕЗ увеличения счётчика.
   * Используется как превью в админке при переключении города.
   */
  async peekNextArticle(
    cityCode?: string | null,
  ): Promise<{ article: string; city: string; regionCode: string; number: number }> {
    const city = String(cityCode || '').trim().toUpperCase() || '00'
    const regionCode = await this.resolveRegionCodeByCityCode(city)
    const nextNumber = await this.computeNextArticleNumber(regionCode)
    const article = this.formatArticle(regionCode, nextNumber)
    return { article, city, regionCode, number: nextNumber }
  }

  /**
   * Резервирует следующий артикул для выбранного города.
   * Счётчик ведётся отдельно для каждого cityCode.
   */
  async reserveNextArticle(cityCode?: string | null): Promise<{ article: string; city: string; regionCode: string; number: number }> {
    const city = String(cityCode || '').trim().toUpperCase() || '00'

    return this.sequencesRepo.manager.transaction(async (manager) => {
      const seqRepo = manager.getRepository(ArticleSequence)
      const regionCode = await this.resolveRegionCodeByCityCode(city, manager)

      // Блокируем sequence-строку (или создаём её) как "мьютекс" для города,
      // но сам номер считаем от ФАКТИЧЕСКОГО максимума среди созданных товаров.
      let seq = await seqRepo.findOne({ where: { cityCode: city }, lock: { mode: 'pessimistic_write' } as any })
      if (!seq) seq = seqRepo.create({ cityCode: city, lastNumber: 0 })

      const nextNumber = await this.computeNextArticleNumber(regionCode, manager)
      seq.lastNumber = nextNumber
      await seqRepo.save(seq)

      const article = this.formatArticle(regionCode, nextNumber)
      return { article, city, regionCode, number: nextNumber }
    })
  }

  /**
   * Считает следующий номер артикула по фактически существующим товарам.
   * Пример: если есть 79-0016, вернёт 17.
   */
  private async computeNextArticleNumber(regionCode: string, manager?: any): Promise<number> {
    // В проекте бывает, что у склада/города не задан regionCode.
    // Тогда артикул форматируется как '00-0001' (см. formatArticle).
    // Важно: в этом случае мы НЕ должны каждый раз начинать с 1,
    // иначе получим дубли по уникальному индексу article.
    const rc = String(regionCode || '').trim() || '00'

    const repo = manager ? manager.getRepository(Product) : this.productsRepo
    // MAX(split_part(article,'-',2)::int) where split_part(article,'-',1)=:rc
    const row = await repo
      .createQueryBuilder('p')
      .select("MAX(CAST(NULLIF(split_part(p.article, '-', 2), '') AS int))", 'maxnum')
      .where("split_part(p.article, '-', 1) = :rc", { rc })
      .andWhere("p.article ~ '^[0-9]+-[0-9]+'")
      .getRawOne()

    const maxnum = Number(row?.maxnum ?? row?.maxnum) || 0
    return maxnum + 1
  }

  async createProduct(dto: CreateProductDto, userId: number | null = null) {
    const category = await this.categoriesRepo.findOne({ where: { id: dto.categoryId } })
    if (!category) throw new NotFoundException('Category not found')

    const city = dto.city ? String(dto.city).trim().toUpperCase() : null
    const articleRaw = String((dto as any).article || '').trim()
    const article = articleRaw ? articleRaw : (await this.reserveNextArticle(city)).article

    const desiredSlug = String((dto as any).slug || dto.name || '').trim()
    const slug = await this.makeUniqueProductSlug(desiredSlug)

    const product = this.productsRepo.create({
      slug,
      name: dto.name,
      article,
      price: dto.price,
      // nullable in DB; omit when not provided
      weight: dto.weight,
      city,
      description: dto.description ?? null,
      specs: dto.specs ?? null,
      isAvailable: dto.isAvailable ?? true,
      isActive: dto.isActive ?? true,
      kind: (dto.kind === 'blank' || dto.kind === 'finished') ? dto.kind : 'finished',
      category,
      popularity: 0,
    })

    await this.productsRepo.save(product)

    // Этап B: «Stock всегда существует» — автосоздание строки stock с qty=0
    const kind = (product as any).kind === 'blank' ? 'blank' : 'finished'
    const targetWarehouse = kind === 'blank' ? WAREHOUSE_CODES.BLANKS : WAREHOUSE_CODES.FINISHED
    await this.ensureStockRow(product, targetWarehouse)

    await this.writeAudit(userId, 'catalog.product.create', 'product', {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      article: product.article,
    })
    const saved = await this.productsRepo.findOne({ where: { id: product.id }, relations: ['category', 'images'] })
    return { product: saved }
  }

  async updateProduct(id: number, dto: UpdateProductDto, userId: number | null = null) {
    const product = await this.productsRepo.findOne({ where: { id }, relations: ['category', 'images'] })
    if (!product) throw new NotFoundException('Product not found')

    const before: any = {
      slug: product.slug,
      name: product.name,
      article: product.article,
      price: product.price,
      weight: product.weight,
      city: product.city,
      description: product.description,
      specs: product.specs,
      isAvailable: product.isAvailable,
      isActive: product.isActive,
      archived: (product as any).archived ?? false,
      kind: product.kind,
      categoryId: product.category?.id ?? null,
    }

    if (typeof dto.slug === 'string') {
      const desired = String(dto.slug || '').trim() || product.slug
      product.slug = await this.makeUniqueProductSlug(desired, id)
    }
    if (typeof dto.name === 'string') product.name = dto.name
    if (typeof dto.article === 'string') product.article = dto.article
    if (typeof dto.price === 'string') product.price = dto.price
    if (dto.weight !== undefined) product.weight = dto.weight
    if (dto.city !== undefined) product.city = dto.city ? String(dto.city).trim().toUpperCase() : null
    if (dto.description !== undefined) product.description = dto.description ?? null
    if (dto.specs !== undefined) product.specs = dto.specs ?? null
    if (typeof dto.isAvailable === 'boolean') product.isAvailable = dto.isAvailable
    if (typeof (dto as any).isActive === 'boolean') product.isActive = (dto as any).isActive
    if (typeof (dto as any).archived === 'boolean') (product as any).archived = (dto as any).archived
    if (typeof (dto as any).kind === 'string') {
      const k = String((dto as any).kind || '').trim() as any
      if (k === 'blank' || k === 'finished') product.kind = k
    }

    if (dto.categoryId) {
      const category = await this.categoriesRepo.findOne({ where: { id: dto.categoryId } })
      if (!category) throw new NotFoundException('Category not found')
      product.category = category
    }

    const after: any = {
      slug: product.slug,
      name: product.name,
      article: product.article,
      price: product.price,
      weight: product.weight,
      city: product.city,
      description: product.description,
      specs: product.specs,
      isAvailable: product.isAvailable,
      isActive: product.isActive,
      archived: (product as any).archived ?? false,
      kind: product.kind,
      categoryId: product.category?.id ?? null,
    }

    await this.productsRepo.save(product)

    // audit field-level changes
    const fields = Object.keys(after)
    for (const field of fields) {
      const a = after[field]
      const b = before[field]
      const changed = JSON.stringify(a) !== JSON.stringify(b)
      if (!changed) continue
      await this.writeAudit(userId, 'catalog.product.update', 'product', {
        productId: id,
        field,
        from: b,
        to: a,
      })
    }

    const saved = await this.productsRepo.findOne({ where: { id }, relations: ['category', 'images'] })
    return { product: saved }
  }

  
async deleteProduct(id: number, userId: number | null = null) {
    // Backward-compatible: DELETE now archives product instead of hard delete.
    const product = await this.productsRepo.findOne({ where: { id }, relations: ['images'] })
    if (!product) throw new NotFoundException('Product not found')

    if ((product as any).archived) {
      return { ok: true, already: true }
    }

    // Soft guard: if product is referenced in orders or has stock, do not allow hard deletion.
    // We archive instead, so history/analytics remain intact.
    ;(product as any).archived = true
    await this.productsRepo.save(product)

    await this.writeAudit(userId, 'catalog.product.archive', 'product', {
      productId: id,
      name: product.name,
      slug: product.slug,
      article: product.article,
    })

    return { ok: true }
  }

  /**
   * Создаёт клон товара как черновик (скрыт из каталога):
   * - новый slug (старый + -copy)
   * - новый article (через ...)
   * - isActive = false
   */
  async cloneProduct(
    id: number,
    userId: number | null = null,
    opts?: { fields?: string[]; includeImages?: boolean },
  ) {
    const src = await this.productsRepo.findOne({ where: { id }, relations: ['category', 'images'] })
    if (!src) throw new NotFoundException('Product not found')

    const allowedFields = new Set([
      'name',
      'price',
      'weight',
      'city',
      'categoryId',
      'isAvailable',
      'kind',
      'description',
      'specs',
    ])
    const fields = Array.isArray(opts?.fields)
      ? opts!.fields.filter((f) => allowedFields.has(String(f)))
      : Array.from(allowedFields)
    const shouldCopy = (f: string) => fields.includes(f)
    const includeImages = opts?.includeImages !== undefined ? !!opts.includeImages : true

    const city = src.city ? String(src.city).trim().toUpperCase() : null
    const article = (await this.reserveNextArticle(city)).article
    const slug = await this.makeUniqueProductSlug(`${src.slug}-copy`)

    const clone = this.productsRepo.create({
      slug,
      name: shouldCopy('name') ? `${src.name} (копия)` : `Новый товар ${article}`,
      article,
      price: shouldCopy('price') ? src.price : '0.00',
      weight: shouldCopy('weight') ? src.weight : undefined,
      city: shouldCopy('city') ? city : null,
      description: shouldCopy('description') ? (src.description ?? null) : null,
      specs: shouldCopy('specs') ? (src.specs ?? null) : null,
      isAvailable: shouldCopy('isAvailable') ? (src.isAvailable ?? true) : true,
      // черновик-клон всегда скрыт, чтобы не ломать витрину
      isActive: false,
      kind: shouldCopy('kind') ? ((src.kind === 'blank' || src.kind === 'finished') ? src.kind : 'finished') : 'finished',
      // Category is required in schema. Always copy it (even if field excluded on UI).
      category: src.category,
      popularity: 0,
    })

    await this.productsRepo.save(clone)

    if (includeImages && Array.isArray(src.images) && src.images.length > 0) {
      const images = src.images
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((img) =>
          this.imagesRepo.create({
            url: img.url,
            sortOrder: img.sortOrder ?? 0,
            product: clone,
          }),
        )
      await this.imagesRepo.save(images)
      await this.writeAudit(userId, 'catalog.product.image.clone', 'product', {
        productId: clone.id,
        sourceProductId: src.id,
        count: images.length,
      })
    }
    await this.writeAudit(userId, 'catalog.product.clone', 'product', {
      productId: clone.id,
      sourceProductId: src.id,
      name: clone.name,
      slug: clone.slug,
      article: clone.article,
      fields,
      includeImages,
    })
    const saved = await this.productsRepo.findOne({ where: { id: clone.id }, relations: ['category', 'images'] })
    return { product: saved }
  }

  async uploadProductImage(productId: number, file: any, userId: number | null = null) {
    if (!file) {
      return { ok: false, message: 'Файл не получен' }
    }

    const product = await this.productsRepo.findOne({ where: { id: productId }, relations: ['images'] })
    if (!product) throw new NotFoundException('Product not found')

    const useLocal = (process.env.ENABLE_LOCAL_UPLOADS || '').toLowerCase() === 'true'

    // --- Store image (local or Object Storage)
    let url: string
    if (useLocal) {
      const folder = join(process.cwd(), 'uploads', 'static', 'products')
      if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })

      const ext = extname(String(file.originalname || '')).toLowerCase() || '.bin'
      const ts = Date.now()
      const rnd = Math.random().toString(16).slice(2)
      const filename = `${ts}-${rnd}${ext}`

      const filePath = join(folder, filename)
      fs.writeFileSync(filePath, file.buffer)
      url = `/uploads/static/products/${filename}`
    } else {
      // Upload to Yandex Object Storage (S3-compatible).
      // If Object Storage is unreachable/denied we throw a clear 400 instead of hanging.
      try {
        const uploaded = await this.objectStorage.uploadPublic({
          buffer: file.buffer,
          mimetype: file.mimetype,
          originalname: file.originalname,
          prefix: 'products',
        })
        url = uploaded.url
      } catch (e: any) {
        const msg = e?.name ? `${e.name}: ${e.message || 'upload failed'}` : e?.message || 'upload failed'
        throw new BadRequestException(`Не удалось загрузить изображение в облако. ${msg}`)
      }
    }

    const currentMax = Math.max(0, ...(product.images || []).map((i) => Number(i.sortOrder) || 0))
    const image = this.imagesRepo.create({
      product,
      url,
      sortOrder: currentMax + 1,
    })
    await this.imagesRepo.save(image)

    await this.writeAudit(userId, 'catalog.product.image.upload', 'product', {
      productId,
      imageId: image.id,
      url: image.url,
      sortOrder: image.sortOrder,
    })

    const saved = await this.productsRepo.findOne({ where: { id: productId }, relations: ['category', 'images'] })
    return { product: saved }
  }

  async updateImage(id: number, dto: UpdateImageDto, userId: number | null = null) {
    const image = await this.imagesRepo.findOne({ where: { id }, relations: ['product'] })
    if (!image) throw new NotFoundException('Image not found')
    const beforeSort = image.sortOrder
    if (dto.sortOrder !== undefined) image.sortOrder = dto.sortOrder
    await this.imagesRepo.save(image)

    if (dto.sortOrder !== undefined && beforeSort !== image.sortOrder) {
      await this.writeAudit(userId, 'catalog.product.image.reorder', 'product', {
        productId: image.product?.id ?? null,
        imageId: image.id,
        from: beforeSort,
        to: image.sortOrder,
      })
    }
    return { image }
  }

  async deleteImage(id: number, userId: number | null = null) {
    const image = await this.imagesRepo.findOne({ where: { id }, relations: ['product'] })
    if (!image) throw new NotFoundException('Image not found')

    await this.writeAudit(userId, 'catalog.product.image.delete', 'product', {
      productId: image.product?.id ?? null,
      imageId: image.id,
      url: image.url,
      sortOrder: image.sortOrder,
    })

    await this.imagesRepo.remove(image)
    return { ok: true }
  }

  async getProductHistory(productId: number, limit = 200) {
    const rows = await this.auditRepo
      .createQueryBuilder('a')
      .leftJoin(User, 'u', 'u.id = a.userId')
      .select([
        'a.id as id',
        'a.action as action',
        'a.entity as entity',
        'a.meta as meta',
        'a.createdAt as createdAt',
        'a.userId as userId',
        'u.name as userName',
        'u.email as userEmail',
      ])
      .where('a.entity = :entity', { entity: 'product' })
      .andWhere("a.meta->>'productId' = :pid", { pid: String(productId) })
      .orderBy('a.createdAt', 'DESC')
      .limit(limit)
      .getRawMany()

    const events = rows.map((r: any) => ({
      id: Number(r.id),
      action: r.action,
      createdAt: r.createdAt,
      user: r.userId ? { id: Number(r.userId), name: r.userName || r.userEmail || `#${r.userId}` } : null,
      meta: r.meta ?? null,
    }))

    return { events }
  }
}
