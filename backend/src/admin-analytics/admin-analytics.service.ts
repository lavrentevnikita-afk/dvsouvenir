import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Category } from '../catalog/category.entity'
import { Product } from '../catalog/product.entity'
import { Order } from '../orders/order.entity'
import { StoreProfile } from '../b2b/store-profile.entity'
import { Stock } from '../b2b/stock.entity'
import { PromoBanner } from '../content/promo-banner.entity'
import { User } from '../users/user.entity'

@Injectable()
export class AdminAnalyticsService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(StoreProfile) private readonly storeRepo: Repository<StoreProfile>,
    @InjectRepository(Stock) private readonly stockRepo: Repository<Stock>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(PromoBanner) private readonly promoRepo: Repository<PromoBanner>,
  ) {}

  private parseDateOnly(s?: string): Date | null {
    if (!s) return null
    const m = String(s).trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(m)) return null
    const d = new Date(m + 'T00:00:00.000Z')
    if (isNaN(d.getTime())) return null
    return d
  }

  private addDays(d: Date, days: number): Date {
    const x = new Date(d)
    x.setUTCDate(x.getUTCDate() + days)
    return x
  }

  async summary(days: number) {
    const now = new Date()
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    const [ordersTotal, productsTotal, categoriesTotal, storesTotal, promosTotal] = await Promise.all([
      this.orderRepo.count(),
      this.productRepo.count(),
      this.categoryRepo.count(),
      this.storeRepo.count(),
      this.promoRepo.count(),
    ])

    const ordersWindowQb = this.orderRepo
      .createQueryBuilder('o')
      .where('o.createdAt >= :from AND o.createdAt <= :now', { from, now })

    const ordersInPeriod = await ordersWindowQb.getCount()

    // Sum revenue for period (numeric in DB)
    const revenueRes = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.totalPrice), 0)', 'sum')
      .where('o.createdAt >= :from AND o.createdAt <= :now', { from, now })
      .getRawOne<{ sum: string }>()
    const revenueInPeriod = Number(revenueRes?.sum || 0)

    // Status counts for period
    const statusRows = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(1)', 'count')
      .where('o.createdAt >= :from AND o.createdAt <= :now', { from, now })
      .groupBy('o.status')
      .getRawMany<{ status: string; count: string }>()
    const statusCounts: Record<string, number> = {}
    for (const r of statusRows) statusCounts[r.status] = Number(r.count || 0)

    // Store profiles by status
    const storeStatusRows = await this.storeRepo
      .createQueryBuilder('s')
      .select('s.status', 'status')
      .addSelect('COUNT(1)', 'count')
      .groupBy('s.status')
      .getRawMany<{ status: string; count: string }>()
    const storeStatusCounts: Record<string, number> = {}
    for (const r of storeStatusRows) storeStatusCounts[r.status] = Number(r.count || 0)

    // Orders by day for the last N days
    const byDayRows = await this.orderRepo
      .createQueryBuilder('o')
      .select("DATE_TRUNC('day', o.createdAt)", 'day')
      .addSelect('COUNT(1)', 'count')
      .addSelect('COALESCE(SUM(o.totalPrice), 0)', 'sum')
      .where('o.createdAt >= :from AND o.createdAt <= :now', { from, now })
      .groupBy("DATE_TRUNC('day', o.createdAt)")
      .orderBy('day', 'ASC')
      .getRawMany<{ day: string; count: string; sum: string }>()

    const byDay = byDayRows.map((r) => ({
      day: r.day,
      count: Number(r.count || 0),
      revenue: Number(r.sum || 0),
    }))

    // Promo schedule health
    const activeNow = await this.promoRepo
      .createQueryBuilder('b')
      .where('b.isActive = true')
      .andWhere('(b.startAt IS NULL OR b.startAt <= :now)', { now })
      .andWhere('(b.endAt IS NULL OR b.endAt >= :now)', { now })
      .getCount()

    return {
      range: { from, to: now, days },
      totals: {
        orders: ordersTotal,
        products: productsTotal,
        categories: categoriesTotal,
        stores: storesTotal,
        promos: promosTotal,
      },
      period: {
        orders: ordersInPeriod,
        revenue: revenueInPeriod,
        aov: ordersInPeriod ? revenueInPeriod / ordersInPeriod : 0,
        statusCounts,
      },
      stores: {
        statusCounts: storeStatusCounts,
      },
      promos: {
        activeNow,
      },
      timeseries: {
        byDay,
      },
    }
  }

  async overview(params: { dateFrom?: string; dateTo?: string; city?: string }) {
    // Treat empty strings as "no filter"
    const city = (params.city || '').trim() || undefined
    const now = new Date()

    // dateFrom/dateTo are expected as YYYY-MM-DD
    const fromParsed = this.parseDateOnly(params.dateFrom)
    const toParsed = this.parseDateOnly(params.dateTo)

    // default: last 30 days (inclusive)
    const to = toParsed ? this.addDays(toParsed, 1) : this.addDays(this.parseDateOnly(now.toISOString().slice(0, 10))!, 1)
    const from = fromParsed ? fromParsed : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)

    const cityLike = city ? `%${city}%` : undefined

    // Use raw SQL to make joins via email and unpack jsonb items.
    // IMPORTANT: The params array MUST match the number of placeholders in the SQL.
    const baseParams: any[] = cityLike ? [from, to, cityLike] : [from, to]

    const whereCity = cityLike ? `AND (sp.city ILIKE $3 OR o.address ILIKE $3)` : ''

    // NOTE: In Postgres, unquoted identifiers are folded to lower-case.
    // Our schema uses camelCase columns (e.g. "createdAt"), so we must quote them in raw SQL.
    const filteredOrdersCte = `
      WITH filtered_orders AS (
        SELECT o.*
        FROM orders o
        LEFT JOIN store_profiles sp ON sp.id = o."shopId"
        WHERE o."createdAt" >= $1 AND o."createdAt" < $2
        ${whereCity}
      )
    `

    // 1) headline metrics
    const head = await this.orderRepo.query(
      `${filteredOrdersCte}
       SELECT
         COALESCE(SUM(o."totalPrice"), 0) AS revenue,
         COUNT(1) AS ordersCount,
         COALESCE(SUM(o."totalPrice"), 0) / NULLIF(COUNT(1), 0) AS avgCheck
       FROM filtered_orders o`,
      baseParams,
    )

    const revenue = Number(head?.[0]?.revenue || 0)
    const ordersCount = Number(head?.[0]?.orderscount || head?.[0]?.ordersCount || 0)
    const avgCheck = Number(head?.[0]?.avgcheck || head?.[0]?.avgCheck || 0)

    // 2) top products
    const topProductsRows = await this.orderRepo.query(
      `${filteredOrdersCte}
       SELECT
         p.id AS "productId",
         p.name AS "name",
         p.article AS "article",
         c.id AS "categoryId",
         c.name AS "categoryName",
         SUM((it->>'quantity')::int) AS qty,
         SUM(((it->>'price')::numeric) * (it->>'quantity')::int) AS revenue
       FROM filtered_orders o,
            LATERAL jsonb_array_elements(o.items) it
       JOIN products p ON p.id = (it->>'productId')::int
       LEFT JOIN categories c ON c.id = p."categoryId"
       GROUP BY p.id, p.name, p.article, c.id, c.name
       ORDER BY revenue DESC
       LIMIT 10`,
      baseParams,
    )

    const topProducts = (topProductsRows || []).map((r: any) => ({
      productId: Number(r.productId),
      name: r.name,
      article: r.article,
      categoryId: r.categoryId ? Number(r.categoryId) : null,
      categoryName: r.categoryName || null,
      qty: Number(r.qty || 0),
      revenue: Number(r.revenue || 0),
    }))

    // 3) top categories
    const topCategoriesRows = await this.orderRepo.query(
      `${filteredOrdersCte}
       SELECT
         c.id AS "categoryId",
         c.name AS "categoryName",
         SUM((it->>'quantity')::int) AS qty,
         SUM(((it->>'price')::numeric) * (it->>'quantity')::int) AS revenue
       FROM filtered_orders o,
            LATERAL jsonb_array_elements(o.items) it
       JOIN products p ON p.id = (it->>'productId')::int
       LEFT JOIN categories c ON c.id = p."categoryId"
       GROUP BY c.id, c.name
       ORDER BY revenue DESC
       LIMIT 10`,
      baseParams,
    )

    const topCategories = (topCategoriesRows || []).map((r: any) => ({
      categoryId: r.categoryId ? Number(r.categoryId) : null,
      categoryName: r.categoryName || 'Без категории',
      qty: Number(r.qty || 0),
      revenue: Number(r.revenue || 0),
    }))

    // 4) preorder share (heuristic)
    const preorderRows = await this.orderRepo.query(
      `${filteredOrdersCte}
       SELECT
         COUNT(1) FILTER (WHERE o.status = 'needs_materials' OR o."allocationIssues" IS NOT NULL) AS preorders,
         COUNT(1) AS total
       FROM filtered_orders o`,
      baseParams,
    )
    const preorders = Number(preorderRows?.[0]?.preorders || 0)
    const preorderShare = ordersCount ? preorders / ordersCount : 0

    // 5) stock deficit (blanks/finished) - by minQty, free = qty - reservedQty
    const stockParams: any[] = city ? [city] : []
    const stockCityWhere = city ? `AND (p.city ILIKE $1 OR p.city IS NULL)` : ''
    const stockDeficitRows = await this.stockRepo.query(
      `SELECT
         s.warehouse AS warehouse,
         COUNT(1) AS positions,
         COALESCE(SUM(GREATEST(0, s."minQty" - (s.qty - s."reservedQty"))), 0) AS deficitUnits
       FROM stocks s
       JOIN products p ON p.id = s."productId"
       WHERE s.warehouse IN ('BLANKS','FINISHED')
         AND s."minQty" > 0
         AND (s.qty - s."reservedQty") < s."minQty"
         ${stockCityWhere}
       GROUP BY s.warehouse`,
      stockParams,
    )

    const stockDeficit: any = {
      blanks: { positions: 0, deficitUnits: 0 },
      finished: { positions: 0, deficitUnits: 0 },
    }
    for (const r of stockDeficitRows || []) {
      const w = String(r.warehouse || '').toUpperCase()
      if (w === 'BLANKS') {
        stockDeficit.blanks = { positions: Number(r.positions || 0), deficitUnits: Number(r.deficitUnits || 0) }
      }
      if (w === 'FINISHED') {
        stockDeficit.finished = { positions: Number(r.positions || 0), deficitUnits: Number(r.deficitUnits || 0) }
      }
    }

    // 6) production lead time (avg hours between createdAt and shippedAt)
    const leadTimeRows = await this.orderRepo.query(
      `${filteredOrdersCte}
       SELECT
         COALESCE(AVG(EXTRACT(EPOCH FROM (o."shippedAt" - o."createdAt")) / 3600.0), 0) AS hours
       FROM filtered_orders o
       WHERE o."shippedAt" IS NOT NULL`,
      baseParams,
    )
    const productionLeadTimeHours = Number(leadTimeRows?.[0]?.hours || 0)

    return {
      range: {
        dateFrom: from.toISOString().slice(0, 10),
        dateTo: this.addDays(to, -1).toISOString().slice(0, 10),
        city,
      },
      revenue,
      ordersCount,
      avgCheck,
      topProducts,
      topCategories,
      preorderShare,
      stockDeficit,
      productionLeadTime: {
        hours: productionLeadTimeHours,
        days: productionLeadTimeHours / 24,
      },
    }
  }

  // New dashboard endpoint - key metrics for admin dashboard
  async dashboard() {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Total revenue (all time)
    const revenueRes = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.totalPrice), 0)', 'total')
      .getRawOne<{ total: string }>()
    const totalRevenue = Number(revenueRes?.total || 0)

    // Total orders count
    const ordersCount = await this.orderRepo.count()

    // Orders today
    const ordersToday = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.createdAt >= :today', { today })
      .getCount()

    // Orders this week
    const ordersThisWeek = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.createdAt >= :weekAgo', { weekAgo })
      .getCount()

    // Orders this month
    const ordersThisMonth = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.createdAt >= :monthAgo', { monthAgo })
      .getCount()

    // Average order value
    const averageOrderValue = ordersCount > 0 ? totalRevenue / ordersCount : 0

    // Top 5 products (by revenue)
    const topProductsRows = await this.orderRepo.query(
      `SELECT
         p.id AS "productId",
         p.name AS "name",
         p.article AS "article",
         p.price AS "price",
         SUM((it->>'quantity')::int) AS qty,
         SUM(((it->>'price')::numeric) * (it->>'quantity')::int) AS revenue
       FROM orders o,
            LATERAL jsonb_array_elements(o.items) it
       JOIN products p ON p.id = (it->>'productId')::int
       GROUP BY p.id, p.name, p.article, p.price
       ORDER BY revenue DESC
       LIMIT 5`,
    )

    const topProducts = (topProductsRows || []).map((r: any) => ({
      productId: Number(r.productId),
      name: r.name,
      article: r.article,
      price: Number(r.price || 0),
      qty: Number(r.qty || 0),
      revenue: Number(r.revenue || 0),
    }))

    // Recent orders (last 10)
    const recentOrders = await this.orderRepo.find({
      order: { createdAt: 'DESC' },
      take: 10,
    })

    return {
      totalRevenue,
      ordersCount,
      ordersToday,
      ordersThisWeek,
      ordersThisMonth,
      averageOrderValue,
      topProducts,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        status: o.status,
        totalPrice: o.totalPrice,
        createdAt: o.createdAt,
        customerName: o.customerName,
        email: o.email,
      })),
    }
  }

  // Sales by day for the last N days
  async sales(days: number = 30) {
    const now = new Date()
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    const byDayRows = await this.orderRepo
      .createQueryBuilder('o')
      .select("DATE_TRUNC('day', o.createdAt)", 'day')
      .addSelect('COUNT(1)', 'count')
      .addSelect('COALESCE(SUM(o.totalPrice), 0)', 'revenue')
      .where('o.createdAt >= :from AND o.createdAt <= :now', { from, now })
      .groupBy("DATE_TRUNC('day', o.createdAt)")
      .orderBy('day', 'ASC')
      .getRawMany<{ day: string; count: string; revenue: string }>()

    return byDayRows.map((r) => ({
      date: r.day.split('T')[0], // YYYY-MM-DD format
      ordersCount: Number(r.count || 0),
      revenue: Number(r.revenue || 0),
    }))
  }

  // Top products by quantity or revenue
  async topProducts(limit: number = 10, sortBy: 'quantity' | 'revenue' = 'revenue') {
    const orderByField = sortBy === 'quantity' ? 'qty' : 'revenue'

    const rows = await this.orderRepo.query(
      `SELECT
         p.id AS "productId",
         p.name AS "name",
         p.article AS "article",
         p.price AS "price",
         c.name AS "categoryName",
         SUM((it->>'quantity')::int) AS qty,
         SUM(((it->>'price')::numeric) * (it->>'quantity')::int) AS revenue
       FROM orders o,
            LATERAL jsonb_array_elements(o.items) it
       JOIN products p ON p.id = (it->>'productId')::int
       LEFT JOIN categories c ON c.id = p."categoryId"
       GROUP BY p.id, p.name, p.article, p.price, c.name
       ORDER BY ${orderByField} DESC
       LIMIT $1`,
      [limit],
    )

    return (rows || []).map((r: any) => ({
      productId: Number(r.productId),
      name: r.name,
      article: r.article,
      price: Number(r.price || 0),
      categoryName: r.categoryName || 'Без категории',
      quantity: Number(r.qty || 0),
      revenue: Number(r.revenue || 0),
    }))
  }

  // Compare retail vs B2B orders
  async retailVsB2b() {
    // Retail: orders without shopId
    const retailRes = await this.orderRepo
      .createQueryBuilder('o')
      .select('COUNT(1)', 'count')
      .addSelect('COALESCE(SUM(o.totalPrice), 0)', 'revenue')
      .where('o.shopId IS NULL')
      .getRawOne<{ count: string; revenue: string }>()

    // B2B: orders with shopId
    const b2bRes = await this.orderRepo
      .createQueryBuilder('o')
      .select('COUNT(1)', 'count')
      .addSelect('COALESCE(SUM(o.totalPrice), 0)', 'revenue')
      .where('o.shopId IS NOT NULL')
      .getRawOne<{ count: string; revenue: string }>()

    const retailOrders = Number(retailRes?.count || 0)
    const retailRevenue = Number(retailRes?.revenue || 0)
    const b2bOrders = Number(b2bRes?.count || 0)
    const b2bRevenue = Number(b2bRes?.revenue || 0)

    const totalOrders = retailOrders + b2bOrders
    const totalRevenue = retailRevenue + b2bRevenue

    return {
      retail: {
        ordersCount: retailOrders,
        revenue: retailRevenue,
        ordersShare: totalOrders > 0 ? (retailOrders / totalOrders) * 100 : 0,
        revenueShare: totalRevenue > 0 ? (retailRevenue / totalRevenue) * 100 : 0,
        averageOrderValue: retailOrders > 0 ? retailRevenue / retailOrders : 0,
      },
      b2b: {
        ordersCount: b2bOrders,
        revenue: b2bRevenue,
        ordersShare: totalOrders > 0 ? (b2bOrders / totalOrders) * 100 : 0,
        revenueShare: totalRevenue > 0 ? (b2bRevenue / totalRevenue) * 100 : 0,
        averageOrderValue: b2bOrders > 0 ? b2bRevenue / b2bOrders : 0,
      },
      total: {
        ordersCount: totalOrders,
        revenue: totalRevenue,
      },
    }
  }

  // Products with low stock (below minQty)
  async lowStock(warehouse?: 'BLANKS' | 'FINISHED') {
    let qb = this.stockRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.product', 'p')
      .where('s.minQty > 0')
      .andWhere('(s.qty - s.reservedQty) < s.minQty')

    if (warehouse) {
      qb = qb.andWhere('s.warehouse = :warehouse', { warehouse })
    }

    const stocks = await qb.orderBy('(s.qty - s.reservedQty)', 'ASC').take(50).getMany()

    return stocks.map((s) => ({
      productId: s.product?.id,
      productName: s.product?.name || 'Unknown',
      article: s.product?.article || '',
      warehouse: s.warehouse,
      currentStock: s.qty - s.reservedQty,
      minQty: s.minQty,
      deficit: s.minQty - (s.qty - s.reservedQty),
    }))
  }
}
