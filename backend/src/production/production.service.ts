import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OpsService } from '../ops/ops.service'
import { Order } from '../orders/order.entity'
import { AuditLog } from '../admin-settings/audit-log.entity'
import { Product } from '../catalog/product.entity'
import { StoreProfile } from '../b2b/store-profile.entity'
import { Shipment } from '../ops/shipment.entity'

@Injectable()
export class ProductionService {
  constructor(
    private readonly opsService: OpsService,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(Shipment)
    private readonly shipmentsRepository: Repository<Shipment>,
  ) {}

  private stripPricesFromQueue(payload: any) {
    const orders = Array.isArray(payload?.orders) ? payload.orders : []
    return {
      ...payload,
      orders: orders.map((o: any) => {
        const { totalPrice, ...rest } = o || {}
        return rest
      }),
    }
  }

  private stripPricesFromOrder(payload: any) {
    if (!payload || !payload.order) return payload
    const order = payload.order
    const clean = { ...order }
    delete (clean as any).totalPrice

    if (Array.isArray((clean as any).lines)) {
      ;(clean as any).lines = (clean as any).lines.map((l: any) => {
        const x = { ...l }
        delete (x as any).price
        return x
      })
    }

    // если где-то вложено items
    if (Array.isArray((clean as any).items)) {
      ;(clean as any).items = (clean as any).items.map((it: any) => {
        const x = { ...it }
        delete (x as any).price
        return x
      })
    }

    return { ...payload, order: clean }
  }

  /**
   * Очередь производства — «список задач».
   * Возвращает только in_work, без цен, с макетами (assets) по товарам.
   */
  async getQueue(
    user: any,
    params: { city?: string; priority?: string; date?: string } = {},
  ) {
    let qb = this.ordersRepository
      .createQueryBuilder('o')
      .where('o.status = :st', { st: 'in_work' })
      // city для B2B: подтягиваем город магазина по стабильной ссылке order.shopId -> store_profiles.id
      .leftJoin(StoreProfile, 'sp', 'sp.id = o.shopId')

    // priority
    if (params.priority) {
      const p = Number(params.priority)
      if (!Number.isNaN(p)) qb = qb.andWhere('o.priority = :p', { p })
    }

    // date=YYYY-MM-DD → фильтр по дедлайну на конкретный день
    if (params.date) {
      const d = String(params.date).trim()
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        const start = new Date(d + 'T00:00:00.000Z')
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1)
        qb = qb.andWhere('o.deadlineAt IS NOT NULL AND o.deadlineAt >= :a AND o.deadlineAt <= :b', {
          a: start,
          b: end,
        })
      }
    }

    // city — сначала по профилю магазина, потом (fallback) по подстроке в адресе
    if (params.city) {
      const c = String(params.city).trim()
      if (c) {
        qb = qb.andWhere('(sp.city ILIKE :c OR o.address ILIKE :c)', { c: `%${c}%` })
      }
    }

    const orders = await qb.orderBy('o.deadlineAt', 'ASC', 'NULLS LAST').addOrderBy('o.createdAt', 'ASC').getMany()

    const productIds = Array.from(
      new Set(orders.flatMap((o) => (o.items || []).map((i) => Number(i.productId)).filter(Boolean))),
    )

    const products = productIds.length
      ? await this.productsRepository.find({ where: productIds.map((id) => ({ id })) as any })
      : []
    const pMap = new Map<number, Product>()
    for (const p of products) pMap.set(Number(p.id), p)

    const rows = orders.map((o) => {
      const items = (o.items || []).map((it) => {
        const p = pMap.get(Number(it.productId))
        const images = (p?.images || [])
          .slice()
          .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
          .map((x: any) => x.url)
        return {
          productId: Number(it.productId),
          name: it.name,
          quantity: Number(it.quantity || 0),
          assets: images,
        }
      })

      const assets = Array.from(new Set(items.flatMap((i: any) => i.assets || [])))

      return {
        orderId: o.id,
        status: o.status,
        priority: o.priority,
        deadline: o.deadlineAt,
        items,
        assets,
        comments: o.comment,
      }
    })

    // совместимость для UI: оставляем ключ orders
    return { orders: rows }
  }

  async getOrderForProduction(orderId: number, user: any) {
    // берём расширенную карточку из OpsService (склады/WO/история) и дополняем полями для production UI
    const [data, order] = await Promise.all([
      this.opsService.getOrder(orderId),
      this.ordersRepository.findOne({ where: { id: orderId } as any }),
    ])

    if (!order) throw new NotFoundException('Заказ не найден')

    // подтягиваем макеты (assets) по товарам
    const itemsRaw = Array.isArray((order as any).items) ? (order as any).items : []
    const productIds = Array.from(new Set(itemsRaw.map((i: any) => Number(i?.productId)).filter(Boolean)))
    const products = productIds.length
      ? await this.productsRepository.find({ where: productIds.map((id) => ({ id })) as any, relations: ['images'] as any })
      : ([] as any[])
    const pMap = new Map<number, Product>()
    for (const p of products as any[]) pMap.set(Number((p as any).id), p as any)

    const checklist = ((order as any).pickingChecklist || {}) as Record<string, boolean>

    // enrich lines: assets + personalization + checked
    if (Array.isArray((data as any)?.lines)) {
      ;(data as any).lines = (data as any).lines.map((l: any) => {
        const pid = Number(l?.productId)
        const p = pid ? pMap.get(pid) : undefined
        const images = (p as any)?.images || []
        const assets = images
          .slice()
          .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
          .map((x: any) => x.url)

        const it = itemsRaw.find((x: any) => Number(x?.productId) === pid)

        // персонализация: берём как есть из jsonb items, если она присутствует (не ломаем старые заказы)
        const personalization =
          (it as any)?.personalization ?? (it as any)?.customization ?? (it as any)?.meta ?? null

        return {
          ...l,
          checked: Boolean(checklist[String(pid)]),
          assets,
          personalization,
          itemNotes: (it as any)?.notes ?? null,
        }
      })
    }

    // дополняем карточку заказа полями, нужными производству
    ;(data as any).order = {
      ...(data as any).order,
      comment: (order as any).comment || null,
      deadlineAt: (order as any).deadlineAt || null,
      priority: (order as any).priority || null,
      packagingRequirements: (order as any).packagingRequirements || null,
      pickingChecklist: checklist,
    }

    return this.stripPricesFromOrder(data)
  }

  async setChecklist(orderId: number, body: { productId: number; checked: boolean }, user: any) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } as any })
    if (!order) throw new NotFoundException('Заказ не найден')
    if (!body?.productId) throw new BadRequestException('productId обязателен')

    const pid = Number(body.productId)
    const checked = Boolean(body.checked)

    const checklist: Record<string, boolean> = { ...(((order as any).pickingChecklist || {}) as any) }
    checklist[String(pid)] = checked
    ;(order as any).pickingChecklist = checklist
    await this.ordersRepository.save(order)

    try {
      await this.auditRepo.save(
        this.auditRepo.create({
          userId: Number(user?.id) || null,
          action: 'production.order.checklist',
          entity: 'order',
          meta: { orderId, productId: pid, checked },
        }),
      )
    } catch {
      // ignore
    }

    return { ok: true }
  }

  async markReady(orderId: number, user: any) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } as any })
    if (!order) throw new NotFoundException('Заказ не найден')
    if (order.status !== 'in_work') {
      // idempotency: если заказ уже готов/отгружен — просто возвращаем уже созданную отгрузку (если есть)
      if (['ready', 'shipped', 'delivered'].includes(String((order as any).status))) {
        const existing = await this.shipmentsRepository.findOne({ where: { orderId } as any })
        if (existing) {
          if ((existing as any).status === 'created') (existing as any).status = 'ready'
          return { ok: true, already: true, shipment: existing }
        }
        return { ok: true, already: true }
      }
      throw new BadRequestException('Заказ не в работе')
    }

    // ✅ для production UI делаем действие "Готово" максимально простым:
    // автоматически считаем, что все позиции собраны.
    const checklist: Record<string, boolean> = {}
    for (const it of order.items || []) {
      if (it?.productId) checklist[String(it.productId)] = true
    }
    ;(order as any).pickingChecklist = checklist
    await this.ordersRepository.save(order)

    const result = await this.opsService.markReadyToShip(orderId, 'FINISHED')

    // audit-log (не ломаем основной поток)
    try {
      await this.auditRepo.save(
        this.auditRepo.create({
          userId: Number(user?.id) || null,
          action: 'production.order.mark_ready',
          entity: 'order',
          meta: { orderId },
        }),
      )
    } catch {
      // ignore
    }

    // result может уже содержать поле ok — кладём его первым и явно перезаписываем
    // чтобы избежать TS2783 ("specified more than once")
    return { ...result, ok: true }
  }
}
