import { Injectable } from '@nestjs/common'
import { Product } from '../../catalog/product.entity'

export type PriceBreakdown = {
  retail: number
  discountPercent: number
  discount: number
  final: number
}

@Injectable()
export class PricingService {
  /**
   * Single source of truth for pricing.
   *
   * Rule:
   *   priceWholesale = round(priceRetail * (1 - discountPercent/100))
   *
   * NOTE: We round retail to integer rubles too, so all downstream totals are stable.
   */
  getPriceForContext(product: Pick<Product, 'price'>, ctx?: { discountPercent?: number } | null): PriceBreakdown {
    const dpRaw = Number(ctx?.discountPercent ?? 0)
    const discountPercent = Math.max(0, Math.min(100, Number.isFinite(dpRaw) ? Math.round(dpRaw) : 0))

    const retailRaw = Number((product as any)?.price ?? 0)
    const retail = Number.isFinite(retailRaw) ? Math.round(retailRaw) : 0

    const final = discountPercent > 0 ? Math.round(retail * (1 - discountPercent / 100)) : retail
    const discount = Math.max(0, retail - final)

    return { retail, discountPercent, discount, final }
  }
}
