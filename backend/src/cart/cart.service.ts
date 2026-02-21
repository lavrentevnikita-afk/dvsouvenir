import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Product } from '../catalog/product.entity'
import { Stock } from '../b2b/stock.entity'
import { StoreProfile } from '../b2b/store-profile.entity'
import { User } from '../users/user.entity'
import { CartPreviewDto } from './dto'
import { PricingService } from '../shared/pricing/pricing.service'

type AvailabilityStatus = 'in_stock' | 'made_to_order' | 'awaiting'

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    @InjectRepository(Stock)
    private readonly stocksRepo: Repository<Stock>,
    @InjectRepository(StoreProfile)
    private readonly storeProfilesRepo: Repository<StoreProfile>,
    private readonly pricing: PricingService,
  ) {}

  private async getDiscountPercentForUser(user?: User | null): Promise<number> {
    if (!user || (user as any).role !== 'store') return 0
    const profile = await this.storeProfilesRepo.findOne({
      where: { user: { id: (user as any).id } },
    })
    const dp = Number((profile as any)?.discountPercent ?? 0)
    if (!Number.isFinite(dp)) return 0
    return Math.max(0, Math.min(100, Math.round(dp)))
  }

  async preview(dto: CartPreviewDto, user?: User | null) {
    if (!dto.items || dto.items.length === 0) {
      return {
        items: [],
        totals: {
          retail: 0,
          discount: 0,
          final: 0,
        },
        canCheckout: false,
      }
    }

    const ids = dto.items.map((i) => Number(i.productId))
    const qtyById = new Map<number, number>()
    for (const i of dto.items) {
      const q = Number(i.quantity)
      if (!Number.isFinite(q) || q <= 0) throw new BadRequestException('quantity must be >= 1')
      qtyById.set(Number(i.productId), Math.round(q))
    }

    const products = await this.productsRepo.find({ where: { id: In(ids) } })
    if (products.length !== ids.length) {
      const found = new Set(products.map((p) => p.id))
      const missing = ids.filter((id) => !found.has(id))
      throw new NotFoundException(`Products not found: ${missing.join(', ')}`)
    }

    // Load stocks for FINISHED + BLANKS for these products
    const stocks = await this.stocksRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.product', 'p')
      .where('p.id IN (:...ids)', { ids })
      .andWhere('s.warehouse IN (:...wh)', { wh: ['FINISHED', 'BLANKS'] })
      .getMany()

    const stockMap = new Map<string, { qty: number; reserved: number }>()
    for (const s of stocks) {
      const pid = Number((s as any).product?.id)
      const wh = String((s as any).warehouse)
      stockMap.set(`${pid}:${wh}`, { qty: Number((s as any).qty || 0), reserved: Number((s as any).reservedQty || 0) })
    }

    const discountPercent = 0

    // Use catalogService for consistent availability logic
    const catalogService = (global as any).catalogService || require('../catalog/catalog.service');
    const getCatalogService = () => {
      if ((global as any).catalogServiceInstance) return (global as any).catalogServiceInstance;
      const CatalogService = catalogService.CatalogService;
      // You may need to inject dependencies here if not using Nest context
      const instance = new CatalogService(
        this.productsRepo,
        this.stocksRepo,
        this.storeProfilesRepo,
        this.pricing,
      );
      (global as any).catalogServiceInstance = instance;
      return instance;
    };

    const items = await Promise.all(products.map(async (p) => {
      const productId = Number(p.id)
      const quantity = qtyById.get(productId) ?? 1
      const pb = this.pricing.getPriceForContext(p as any, { discountPercent: 0 })
      const retailUnit = pb.retail
      const finalUnit = pb.final
      const discountUnit = pb.discount

      // Use catalogService's computeAvailabilityForProduct for consistent logic
      let availabilityStatus: AvailabilityStatus = 'awaiting'
      let canOrder = false
      try {
        const catalog = getCatalogService();
        if (catalog.computeAvailabilityForProduct) {
          const avail = await catalog.computeAvailabilityForProduct(productId, quantity)
          availabilityStatus = avail.availabilityStatus as AvailabilityStatus
          canOrder = avail.canOrder
        } else {
          // fallback to old logic if not available
          const fin = stockMap.get(`${productId}:FINISHED`)
          const bla = stockMap.get(`${productId}:BLANKS`)
          const finishedFree = Math.max(0, (fin?.qty ?? 0) - (fin?.reserved ?? 0))
          const blanksFree = Math.max(0, (bla?.qty ?? 0) - (bla?.reserved ?? 0))
          if (finishedFree > 0) availabilityStatus = 'in_stock'
          else if (blanksFree > 0) availabilityStatus = 'made_to_order'
          const maxPossible = finishedFree + blanksFree
          canOrder = maxPossible >= quantity
        }
      } catch (e) {
        // fallback to old logic on error
        const fin = stockMap.get(`${productId}:FINISHED`)
        const bla = stockMap.get(`${productId}:BLANKS`)
        const finishedFree = Math.max(0, (fin?.qty ?? 0) - (fin?.reserved ?? 0))
        const blanksFree = Math.max(0, (bla?.qty ?? 0) - (bla?.reserved ?? 0))
        if (finishedFree > 0) availabilityStatus = 'in_stock'
        else if (blanksFree > 0) availabilityStatus = 'made_to_order'
        const maxPossible = finishedFree + blanksFree
        canOrder = maxPossible >= quantity
      }

      return {
        product: {
          id: productId,
          name: String(p.name || ''),
          article: String((p as any).article || ''),
          imageUrl: (p as any)?.images?.[0]?.url ?? null,
        },
        quantity,
        availability: {
          status: availabilityStatus,
          canOrder,
        },
        price: {
          retailUnit,
          discountPercent: (user && (user as any).role === 'store') ? discountPercent : 0,
          discountUnit,
          finalUnit,
          retailLine: retailUnit * quantity,
          discountLine: discountUnit * quantity,
          finalLine: finalUnit * quantity,
        },
      }
    }))

    const totals = items.reduce(
      (acc, it) => {
        acc.retail += Number(it.price.retailLine || 0)
        acc.discount += Number(it.price.discountLine || 0)
        acc.final += Number(it.price.finalLine || 0)
        return acc
      },
      { retail: 0, discount: 0, final: 0 },
    )

    const canCheckout = items.every((i) => i.availability.canOrder)

    return {
      items,
      totals,
      canCheckout,
    }
  }
}
