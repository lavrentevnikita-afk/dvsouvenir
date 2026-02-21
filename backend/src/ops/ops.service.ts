import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, In, Repository } from 'typeorm'
import { Order } from '../orders/order.entity'
import { Stock } from '../b2b/stock.entity'
import { Warehouse } from './warehouse.entity'
import { StockMovement } from './stock-movement.entity'
import type { StockMovementType } from '../shared/enums'
import { ProductionTask, ProductionStatus } from './production-task.entity'
import { OrderComment } from './order-comment.entity'
import { Shipment } from './shipment.entity'
import { Product } from '../catalog/product.entity'
import { User } from '../users/user.entity'
import { InventorySession } from './inventory-session.entity'
import { InventoryItem } from './inventory-item.entity'
import { SystemEvent } from './system-event.entity'
import { SettingsKv } from '../admin-settings/settings-kv.entity'
import { AuditLog } from '../admin-settings/audit-log.entity'
import { WAREHOUSE_CODES, WAREHOUSE_TYPES } from '../shared/enums'
import { InventoryReservation, ReservationKind } from './inventory-reservation.entity'
import { AppErrorCode, throwAppError } from '../shared/errors/app-error'
import { BomItem } from '../catalog/bom-item.entity'
import { WorkOrder, WorkOrderStatus } from './work-order.entity'
import { City } from '../catalog/city.entity'
import { StoreProfile } from '../b2b/store-profile.entity'

export type OrderStatus = 'new' | 'confirmed' | 'in_work' | 'shipped' | 'closed' | 'needs_materials'

const ALLOWED_STATUSES: OrderStatus[] = [
  'new',
  'confirmed',
  'in_work',
  'shipped',
  'closed',
  'needs_materials',
]

@Injectable()
export class OpsService {
  private readonly logger = new Logger(OpsService.name)
  // По умолчанию операционные потоки (заказы/отгрузки) работают со складом готовой продукции.
  static readonly DEFAULT_WAREHOUSE = 'FINISHED'
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Stock)
    private readonly stocksRepository: Repository<Stock>,
    @InjectRepository(Warehouse)
    private readonly warehousesRepository: Repository<Warehouse>,
    @InjectRepository(StockMovement)
    private readonly movementsRepository: Repository<StockMovement>,
    @InjectRepository(ProductionTask)
    private readonly productionRepository: Repository<ProductionTask>,
    @InjectRepository(OrderComment)
    private readonly commentsRepository: Repository<OrderComment>,
    @InjectRepository(Shipment)
    private readonly shipmentsRepository: Repository<Shipment>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(InventorySession)
    private readonly inventoryRepository: Repository<InventorySession>,
    @InjectRepository(InventoryItem)
    private readonly inventoryItemsRepository: Repository<InventoryItem>,

    @InjectRepository(SystemEvent)
    private readonly systemEventsRepository: Repository<SystemEvent>,

    @InjectRepository(SettingsKv)
    private readonly settingsRepository: Repository<SettingsKv>,

    @InjectRepository(InventoryReservation)
    private readonly reservationsRepository: Repository<InventoryReservation>,

    @InjectRepository(BomItem)
    private readonly bomRepository: Repository<BomItem>,

    @InjectRepository(WorkOrder)
    private readonly workOrdersRepository: Repository<WorkOrder>,

    @InjectRepository(City)
    private readonly citiesRepository: Repository<City>,

    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,

    @InjectRepository(StoreProfile)
    private readonly storeProfilesRepository: Repository<StoreProfile>,
  ) {}

  private async audit(userId: number | null, action: string, entity?: string | null, meta?: any) {
    try {
      await this.auditRepository.save(
        this.auditRepository.create({
          userId: userId ?? null,
          action,
          entity: entity ?? null,
          meta: meta ?? null,
        }),
      )
    } catch (e) {
      // audit не должен ломать основную операцию
      this.logger?.warn?.(`audit failed: ${String((e as any)?.message || e)}`)
    }
  }

  // ---------- Dashboard (операционная сводка) ----------

  async dashboard(params: { dateFrom?: string; dateTo?: string; warehouse?: string; userId?: number }) {
    const now = new Date()

    // Range
    const to = params.dateTo ? new Date(params.dateTo) : now
    const from = params.dateFrom ? new Date(params.dateFrom) : new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const wh = String(params.warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    await this.ensureWarehouse(wh)

    // lastSeen (для новых ошибок)
    const userId = Number(params.userId || 0)
    const lastSeenKey = userId ? `system_events_last_seen_user_${userId}` : ''
    let lastSeen = new Date(0)
    if (lastSeenKey) {
      const kv = await this.settingsRepository.findOne({ where: { key: lastSeenKey } as any })
      const v = kv?.value
      const dt = v?.lastSeenAt ? new Date(v.lastSeenAt) : null
      if (dt && !Number.isNaN(dt.getTime())) lastSeen = dt
    }

    // Orders window
    const ordersQb = this.ordersRepository
      .createQueryBuilder('o')
      .where('o.createdAt >= :from AND o.createdAt <= :to', { from, to })

    const [ordersTotal, ordersNew, ordersInWork] = await Promise.all([
      ordersQb.getCount(),
      this.ordersRepository
        .createQueryBuilder('o')
        .where('o.createdAt >= :from AND o.createdAt <= :to', { from, to })
        .andWhere('o.status = :st', { st: 'new' })
        .getCount(),
      this.ordersRepository
        .createQueryBuilder('o')
        .where('o.createdAt >= :from AND o.createdAt <= :to', { from, to })
        .andWhere('o.status = :st', { st: 'in_work' })
        .getCount(),
    ])

    // Orders waiting for warehouse/production (дефицит): есть production task без movedToStockAt
    const deficitOrderRows = await this.productionRepository
      .createQueryBuilder('t')
      .select('t.orderId', 'orderId')
      .where('t.movedToStockAt IS NULL')
      .groupBy('t.orderId')
      .getRawMany<{ orderId: string }>()
    const deficitOrderIds = deficitOrderRows.map((r) => Number(r.orderId)).filter(Boolean)

    const ordersWaitingStock = deficitOrderIds.length
      ? await this.ordersRepository
          .createQueryBuilder('o')
          .where('o.id IN (:...ids)', { ids: deficitOrderIds })
          .andWhere('o.status IN (:...sts)', { sts: ['new', 'confirmed', 'in_work'] })
          .getCount()
      : 0

    // Shipments
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1)

    const shippedToday = await this.ordersRepository
      .createQueryBuilder('o')
      .where('o.status = :st', { st: 'shipped' })
      .andWhere('o.shippedAt IS NOT NULL')
      .andWhere('o.shippedAt >= :ts AND o.shippedAt <= :te', { ts: todayStart, te: todayEnd })
      .getCount()

    // Ready to ship: в работе и нет открытого дефицита
    const readyToShip = await this.ordersRepository
      .createQueryBuilder('o')
      .where('o.status = :st', { st: 'in_work' })
      .andWhere('o.createdAt >= :from AND o.createdAt <= :to', { from, to })
      .andWhere(
        deficitOrderIds.length
          ? 'o.id NOT IN (:...ids)'
          : '1=1',
        deficitOrderIds.length ? { ids: deficitOrderIds } : {},
      )
      .getCount()

    // Stocks
    const stocks = await this.stocksRepository.find({ where: { warehouse: wh } as any })
    const deficitPositions = stocks.filter((s: any) => (s.onOrderQty || 0) > 0).length
    const criticalPositions = stocks.filter((s: any) => (s.onOrderQty || 0) > 0 && (s.qty || 0) <= 0).length

    // Дефицит ниже min-нормы
    const belowMin = (stocks as any[])
      .map((s) => {
        const qty = Number(s?.qty || 0)
        const res = Number(s?.reservedQty || 0)
        const available = Math.max(0, qty - res)
        const min = Number(s?.minQty || 0)
        return { s, available, min, delta: available - min }
      })
      .filter((x) => x.min > 0 && x.available < x.min)
      .sort((a, b) => a.delta - b.delta)

    const belowMinCount = belowMin.length

    // Просроченные заказы по дедлайну
    const overdueOrders = await this.ordersRepository
      .createQueryBuilder('o')
      .where('o.deadlineAt IS NOT NULL')
      .andWhere('o.deadlineAt < :now', { now })
      .andWhere('o.status != :closed', { closed: 'closed' })
      .orderBy('o.deadlineAt', 'ASC')
      .limit(20)
      .getMany()
    const overdueOrdersCount = overdueOrders.length

    // Ошибки системы (новые с lastSeen)
    const sysEvents = await this.systemEventsRepository
      .createQueryBuilder('e')
      .where('e.level IN (:...lvls)', { lvls: ['error', 'critical'] })
      .andWhere('e.createdAt > :ls', { ls: lastSeen })
      .orderBy('e.createdAt', 'DESC')
      .limit(20)
      .getMany()
    const sysErrorsCount = sysEvents.length

    // Top 5: склеиваем самое срочное
    const top: any[] = []

    for (const o of overdueOrders.slice(0, 5)) {
      top.push({
        kind: 'overdue_order',
        score: 90,
        title: `Просрочен дедлайн · Заказ #${(o as any).id}`,
        subtitle: `Дедлайн: ${new Date((o as any).deadlineAt).toLocaleString('ru-RU')}`,
        href: { path: '/admin/orders', query: { status: 'in_work', overdue: '1' } },
      })
    }

    for (const x of belowMin.slice(0, 5)) {
      const p = (x.s as any)?.product
      top.push({
        kind: 'below_min',
        score: 70,
        title: `Ниже min · ${(p?.name || `Товар #${p?.id || ''}`).trim()}`,
        subtitle: `Доступно: ${x.available} / min: ${x.min}`,
        href: { path: '/admin/warehouse', query: { tab: 'blanks', belowMin: '1' } },
      })
    }

    for (const e of sysEvents.slice(0, 5)) {
      top.push({
        kind: 'system_error',
        score: (e as any).level === 'critical' ? 100 : 95,
        title: `${(e as any).level === 'critical' ? 'CRITICAL' : 'ERROR'} · ${(e as any).message || 'System event'}`,
        subtitle: new Date((e as any).createdAt).toLocaleString('ru-RU'),
        href: { path: '/admin/settings', query: { tab: 'system' } },
      })
    }

    const top5 = top
      .sort((a, b) => (b.score - a.score))
      .slice(0, 5)

    // Production
    const prodInWork = await this.productionRepository
      .createQueryBuilder('t')
      .where('t.status = :st', { st: 'in_work' })
      .andWhere('t.movedToStockAt IS NULL')
      .getCount()

    const overdueThreshold = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    const prodOverdue = await this.productionRepository
      .createQueryBuilder('t')
      .where('t.status != :ready', { ready: 'ready' })
      .andWhere('t.movedToStockAt IS NULL')
      .andWhere('(t.updatedAt <= :thr OR t.createdAt <= :thr)', { thr: overdueThreshold })
      .getCount()

    // Requires attention lists
    const deficitOrders = deficitOrderIds.length
      ? await this.ordersRepository
          .createQueryBuilder('o')
          .where('o.id IN (:...ids)', { ids: deficitOrderIds })
          .andWhere('o.status IN (:...sts)', { sts: ['new', 'confirmed', 'in_work'] })
          .orderBy('o.createdAt', 'DESC')
          .limit(20)
          .getMany()
      : []

    const overdueTasks = await this.productionRepository
      .createQueryBuilder('t')
      .where('t.status != :ready', { ready: 'ready' })
      .andWhere('t.movedToStockAt IS NULL')
      .andWhere('(t.updatedAt <= :thr OR t.createdAt <= :thr)', { thr: overdueThreshold })
      .orderBy('t.updatedAt', 'ASC')
      .limit(20)
      .getMany()

    const lateThreshold = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    const lateShipOrders = await this.ordersRepository
      .createQueryBuilder('o')
      .where('o.status IN (:...sts)', { sts: ['confirmed', 'in_work'] })
      .andWhere('o.createdAt <= :thr', { thr: lateThreshold })
      .orderBy('o.createdAt', 'ASC')
      .limit(20)
      .getMany()

    return {
      range: { from, to, warehouse: wh },
      kpi: {
        orders: {
          total: ordersTotal,
          new: ordersNew,
          inWork: ordersInWork,
          waitingWarehouse: ordersWaitingStock,
        },
        shipments: {
          readyToShip,
          shippedToday,
        },
        stocks: {
          deficitPositions,
          criticalPositions,
        },
        production: {
          inWork: prodInWork,
          overdue: prodOverdue,
        },
      },
      attention: {
        deficitOrders,
        overdueTasks,
        lateShipOrders,
      },

      // Новый виджет: «Что требует внимания сейчас»
      attentionNow: {
        counts: {
          overdueOrders: overdueOrdersCount,
          belowMinPositions: belowMinCount,
          systemErrorsNew: sysErrorsCount,
        },
        top5,
      },
    }
  }

  // ---------- In work (сборка/комплектация) ----------

  private normalizeChecklist(o: Order) {
    const current = (o.pickingChecklist || {}) as Record<string, boolean>
    const next: Record<string, boolean> = { ...current }
    for (const it of o.items || []) {
      const key = String(it.productId)
      if (typeof next[key] !== 'boolean') next[key] = false
    }
    return next
  }

  async listInWork(params: { priority?: string; deadline?: string; assignee?: string; warehouse?: string }) {
    const wh = String(params.warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    await this.ensureWarehouse(wh)

    let qb = this.ordersRepository.createQueryBuilder('o').where('o.status = :st', { st: 'in_work' })

    if (params.priority) {
      const p = Number(params.priority)
      if (!Number.isNaN(p)) qb = qb.andWhere('o.priority = :p', { p })
    }
    if (params.deadline) {
      // deadline=today|overdue|week|none
      const now = new Date()
      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endToday = new Date(startToday.getTime() + 24 * 60 * 60 * 1000 - 1)
      const endWeek = new Date(startToday.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
      const key = String(params.deadline)
      if (key === 'overdue') qb = qb.andWhere('o.deadlineAt IS NOT NULL AND o.deadlineAt < :st', { st: startToday })
      else if (key === 'today') qb = qb.andWhere('o.deadlineAt IS NOT NULL AND o.deadlineAt >= :a AND o.deadlineAt <= :b', { a: startToday, b: endToday })
      else if (key === 'week') qb = qb.andWhere('o.deadlineAt IS NOT NULL AND o.deadlineAt >= :a AND o.deadlineAt <= :b', { a: startToday, b: endWeek })
      else if (key === 'none') qb = qb.andWhere('o.deadlineAt IS NULL')
    }
    if (params.assignee) {
      const a = String(params.assignee).trim()
      if (a) qb = qb.andWhere('LOWER(o.assignee) LIKE :a', { a: `%${a.toLowerCase()}%` })
    }

    const orders = await qb.orderBy('o.createdAt', 'DESC').getMany()

    const productIds = Array.from(new Set(orders.flatMap((o) => (o.items || []).map((i) => Number(i.productId)).filter(Boolean))))
    const stocks = productIds.length
      ? await this.stocksRepository.find({ where: productIds.map((pid) => ({ warehouse: wh, productId: pid })) as any })
      : []
    const stockMap = new Map<number, { qty: number; reserved: number }>()
    for (const s of stocks as any[]) stockMap.set(Number(s.productId), { qty: Number(s.qty || 0), reserved: Number(s.reservedQty || 0) })

    // ensure checklist exists
    for (const o of orders) {
      const next = this.normalizeChecklist(o)
      if (JSON.stringify(next) !== JSON.stringify(o.pickingChecklist || {})) {
        o.pickingChecklist = next
        await this.ordersRepository.save(o)
      }
    }

    const rows = orders.map((o) => {
      const checklist = (o.pickingChecklist || {}) as Record<string, boolean>
      const lines = (o.items || []).map((it) => {
        const st = stockMap.get(Number(it.productId)) || { qty: 0, reserved: 0 }
        const available = Math.max(0, st.qty - st.reserved)
        const need = Number(it.quantity || 0)
        const ok = available >= need
        return {
          productId: it.productId,
          name: it.name,
          quantity: need,
          stock: { qty: st.qty, reserved: st.reserved, available },
          stockOk: ok,
          checked: Boolean(checklist[String(it.productId)]),
        }
      })

      const allChecked = lines.length ? lines.every((l) => l.checked) : false
      const allStockOk = lines.length ? lines.every((l) => l.stockOk) : false

      return {
        id: o.id,
        createdAt: o.createdAt,
        customerName: o.customerName,
        totalPrice: o.totalPrice,
        priority: o.priority,
        deadlineAt: o.deadlineAt,
        assignee: o.assignee,
        lines,
        allChecked,
        allStockOk,
      }
    })

    return { orders: rows, warehouse: wh }
  }

  async setInWorkMeta(orderId: number, meta: { priority?: number | null; deadlineAt?: string | null; assignee?: string | null }) {
    const o = await this.ordersRepository.findOne({ where: { id: orderId } as any })
    if (!o) throw new NotFoundException('Order not found')
    if (typeof meta.priority !== 'undefined') o.priority = meta.priority === null ? null : Number(meta.priority)
    if (typeof meta.deadlineAt !== 'undefined') o.deadlineAt = meta.deadlineAt ? new Date(meta.deadlineAt) : null
    if (typeof meta.assignee !== 'undefined') o.assignee = meta.assignee ? String(meta.assignee) : null
    await this.ordersRepository.save(o)
    return { ok: true }
  }

  async toggleChecklist(orderId: number, productId: number, checked: boolean) {
    const o = await this.ordersRepository.findOne({ where: { id: orderId } as any })
    if (!o) throw new NotFoundException('Order not found')
    const next = this.normalizeChecklist(o)
    next[String(productId)] = Boolean(checked)
    o.pickingChecklist = next
    await this.ordersRepository.save(o)
    return { ok: true, checklist: next }
  }

  async markReadyToShip(orderId: number, warehouse: string) {
    const wh = String(warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    await this.ensureWarehouse(wh)
    const o = await this.ordersRepository.findOne({ where: { id: orderId } as any })
    if (!o) throw new NotFoundException('Order not found')
    if (o.status !== 'in_work') {
      // idempotency: если заказ уже готов/отгружен, просто возвращаем существующую отгрузку (если есть)
      if (['ready', 'shipped', 'delivered'].includes(String((o as any).status))) {
        const existing = await this.shipmentsRepository.findOne({ where: { orderId } as any })
        if (existing) {
          if ((existing as any).status === 'created') (existing as any).status = 'ready'
          return { ok: true, already: true, shipment: existing }
        }
        return { ok: true, already: true }
      }
      throwAppError(
        AppErrorCode.ORDER_STATUS_CONFLICT,
        'Заказ не находится в статусе "в работе"',
        { orderId, status: String((o as any).status) },
        HttpStatus.CONFLICT,
      )
    }

    const checklist = this.normalizeChecklist(o)
    o.pickingChecklist = checklist
    await this.ordersRepository.save(o)

    const productIds = Array.from(new Set((o.items || []).map((i) => Number(i.productId)).filter(Boolean)))
    const stocks = productIds.length
      ? await this.stocksRepository.find({ where: productIds.map((pid) => ({ warehouse: wh, productId: pid })) as any })
      : []
    const stockMap = new Map<number, { qty: number; reserved: number }>()
    for (const s of stocks as any[]) stockMap.set(Number(s.productId), { qty: Number(s.qty || 0), reserved: Number(s.reservedQty || 0) })

    const allChecked = (o.items || []).length && (o.items || []).every((it) => Boolean(checklist[String(it.productId)]))
    if (!allChecked) {
      throwAppError(
        AppErrorCode.VALIDATION_ERROR,
        'Сначала отметьте все позиции как собранные',
        { orderId },
        HttpStatus.UNPROCESSABLE_ENTITY,
      )
    }

    const allStockOk = (o.items || []).length && (o.items || []).every((it) => {
      const st = stockMap.get(Number(it.productId)) || { qty: 0, reserved: 0 }
      const available = Math.max(0, st.qty - st.reserved)
      return available >= Number(it.quantity || 0)
    })
    if (!allStockOk) {
      throwAppError(
        AppErrorCode.CART_ITEM_UNAVAILABLE,
        'Недостаточно товара на складе для отгрузки',
        { orderId },
        HttpStatus.CONFLICT,
      )
    }

    // создаём отгрузку (если уже есть — вернём существующую)
    const existing = await this.shipmentsRepository.findOne({ where: { orderId } as any })
    if (existing) {
      // normalize legacy value
      if ((existing as any).status === 'created') (existing as any).status = 'ready'
      return { ok: true, already: true, shipment: existing }
    }
    const created = await this.createShipment(orderId)
    return { ok: true, shipment: (created as any)?.shipment || created }
  }

  // ---------- Orders ----------

  async listOrders(params: {
    status?: string
    q?: string
    dateFrom?: string
    dateTo?: string
    warehouse?: string
    store?: string
    problematic?: string
    overdue?: string
  }) {
    const wh = String(params.warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    await this.ensureWarehouse(wh)

    const qb = this.ordersRepository
      .createQueryBuilder('o')
      .orderBy('o.createdAt', 'DESC')

    if (params.status && ALLOWED_STATUSES.includes(params.status as OrderStatus)) {
      qb.andWhere('o.status = :status', { status: params.status })
    }

    if (params.q) {
      const q = String(params.q).trim().toLowerCase()
      if (q) {
        // по id, имени, email
        if (/^\d+$/.test(q)) {
          qb.andWhere('o.id = :id', { id: Number(q) })
        } else {
          qb.andWhere(
            '(LOWER(o.customerName) LIKE :q OR LOWER(o.email) LIKE :q OR LOWER(o.address) LIKE :q)',
            { q: `%${q}%` },
          )
        }
      }
    }

    if (params.dateFrom) {
      qb.andWhere('o.createdAt >= :df', { df: new Date(params.dateFrom) })
    }
    if (params.dateTo) {
      qb.andWhere('o.createdAt <= :dt', { dt: new Date(params.dateTo) })
    }

    // overdue=1 -> дедлайн просрочен
    const wantOverdue = String(params.overdue || '').toLowerCase()
    if (wantOverdue === '1' || wantOverdue === 'true') {
      const now = new Date()
      qb.andWhere('o.deadlineAt IS NOT NULL AND o.deadlineAt < :now', { now })
      qb.andWhere('o.status != :closed', { closed: 'closed' })
    }

    const orders = await qb.getMany()

    if (!orders.length) return { orders: [] }

    // Enrich B2B shop info by stable link: order.shopId -> store_profiles.id
    const shopIds = Array.from(new Set(orders.map((o: any) => Number((o as any).shopId)).filter((id) => id > 0)))
    const shopById = new Map<number, { label: string; city: string | null }>()
    if (shopIds.length) {
      const shops = await this.storeProfilesRepository.find({ where: { id: In(shopIds) } })
      for (const s of shops) {
        const id = Number((s as any).id)
        const label = String((s as any).displayName || (s as any).companyName || 'Магазин')
        const city = (s as any).city ? String((s as any).city) : null
        if (id) shopById.set(id, { label, city })
      }
    }

    // --- Enrich: склад/производство/отгрузка ---
    const orderIds = orders.map((o) => o.id)

    const allProductIds = Array.from(
      new Set(
        orders
          .flatMap((o) => Array.isArray((o as any).items) ? (o as any).items : [])
          .map((i: any) => Number(i?.productId))
          .filter(Boolean),
      ),
    )

    const [stocks, tasks, shipments] = await Promise.all([
      allProductIds.length
        ? this.stocksRepository
            .createQueryBuilder('s')
            .leftJoinAndSelect('s.product', 'p')
            .where('s.warehouse = :wh', { wh })
            .andWhere('p.id IN (:...ids)', { ids: allProductIds })
            .getMany()
        : Promise.resolve([] as any[]),
      this.productionRepository
        .createQueryBuilder('t')
        .where('t.orderId IN (:...ids)', { ids: orderIds })
        .getMany(),
      this.shipmentsRepository
        .createQueryBuilder('sh')
        .where('sh.orderId IN (:...ids)', { ids: orderIds })
        .getMany(),
    ])

    const stockByProductId = new Map<number, Stock>()
    for (const s of stocks as any[]) {
      const pid = Number((s as any)?.product?.id)
      if (pid) stockByProductId.set(pid, s)
    }

    const tasksByOrderId = new Map<number, ProductionTask[]>()
    for (const t of tasks) {
      const id = Number((t as any).orderId)
      if (!tasksByOrderId.has(id)) tasksByOrderId.set(id, [])
      tasksByOrderId.get(id)!.push(t)
    }

    const shipmentByOrderId = new Map<number, Shipment>()
    for (const sh of shipments) {
      const id = Number((sh as any).orderId)
      // берем самый свежий
      const prev = shipmentByOrderId.get(id)
      if (!prev || (prev as any).createdAt < (sh as any).createdAt) shipmentByOrderId.set(id, sh)
    }

    const enriched = orders.map((o: any) => {
      const items = Array.isArray(o.items) ? o.items : []

      let okCount = 0
      let partialCount = 0
      let deficitCount = 0

      for (const it of items) {
        const pid = Number(it.productId)
        const need = Number(it.quantity) || 0
        const st = pid ? stockByProductId.get(pid) : undefined
        const available = st ? Math.max(0, (st.qty || 0) - (st.reservedQty || 0)) : 0
        if (available >= need) okCount++
        else if (available > 0) partialCount++
        else deficitCount++
      }

      const warehouseStatus = deficitCount > 0 ? 'deficit' : partialCount > 0 ? 'partial' : 'ok'

      const tlist = tasksByOrderId.get(o.id) || []
      let productionStatus: 'not_needed' | 'planned' | 'in_work' | 'ready' = 'not_needed'
      if (tlist.length) {
        if (tlist.some((t: any) => t.status === 'in_work')) productionStatus = 'in_work'
        else if (tlist.some((t: any) => t.status === 'planned')) productionStatus = 'planned'
        else productionStatus = 'ready'
      }

      const sh = shipmentByOrderId.get(o.id)
      let shipmentStatus: 'not_ready' | 'ready' | 'shipped' = 'not_ready'
      if (o.status === 'shipped' || sh?.status === 'shipped') shipmentStatus = 'shipped'
      else {
        const readyToShip = warehouseStatus === 'ok' && (productionStatus === 'not_needed' || productionStatus === 'ready')
        if (readyToShip) shipmentStatus = 'ready'
      }

      return {
        id: o.id,
        createdAt: o.createdAt,
        customerName: o.customerName,
        email: o.email,
        phone: o.phone,
        totalPrice: o.totalPrice,
        status: o.status,
        shopId: (o as any).shopId ?? null,
        store: ((o as any).shopId && shopById.get(Number((o as any).shopId))?.label) ? shopById.get(Number((o as any).shopId))!.label : (o.store || o.shop || 'Сайт'),
        shopCity: ((o as any).shopId && shopById.get(Number((o as any).shopId))?.city) ? shopById.get(Number((o as any).shopId))!.city : null,
        warehouseStatus,
        productionStatus,
        shipmentStatus,
      }
    })

    // problematic filter (мягкий): дефицит / частично / производство не готово / отгрузка не готова при in_work
    const wantProblematic = String(params.problematic || '').toLowerCase()
    const filtered = wantProblematic === '1' || wantProblematic === 'true'
      ? enriched.filter((o: any) =>
          o.warehouseStatus !== 'ok' ||
          (o.productionStatus !== 'not_needed' && o.productionStatus !== 'ready') ||
          (o.status === 'in_work' && o.shipmentStatus !== 'ready' && o.shipmentStatus !== 'shipped'),
        )
      : enriched


    // store filter:
    // - legacy: сравнение по строке 'store'
    // - new: 'store=shop:<id>' чтобы фильтровать B2B по shopId
    const store = String(params.store || '').trim()
    let filtered2 = filtered
    if (store && store !== 'all') {
      const m = /^shop:(\d+)$/.exec(store)
      if (m) {
        const sid = Number(m[1])
        filtered2 = filtered.filter((o: any) => Number(o.shopId) === sid)
      } else {
        filtered2 = filtered.filter((o: any) => String(o.store || '').toLowerCase() === store.toLowerCase())
      }
    }

    return { orders: filtered2 }
  }

  async getOrder(orderId: number, warehouse = OpsService.DEFAULT_WAREHOUSE) {
    const wh = String(warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    await this.ensureWarehouse(wh)

    const order = await this.ordersRepository.findOne({ where: { id: orderId } as any })
    if (!order) throw new NotFoundException('Заказ не найден')

    const items = Array.isArray((order as any).items) ? (order as any).items : []
    const productIds = Array.from(new Set(items.map((i: any) => Number(i?.productId)).filter(Boolean)))

    const [stocks, tasks, workOrders, shipment, comments, products] = await Promise.all([
      productIds.length
        ? this.stocksRepository
            .createQueryBuilder('s')
            .leftJoinAndSelect('s.product', 'p')
            .where('s.warehouse = :wh', { wh })
            .andWhere('p.id IN (:...ids)', { ids: productIds })
            .getMany()
        : Promise.resolve([] as any[]),
      this.productionRepository.find({ where: { orderId } as any }),
      this.workOrdersRepository.find({ where: { orderId } as any, order: { updatedAt: 'DESC' } as any }),
      this.shipmentsRepository
        .createQueryBuilder('sh')
        .where('sh.orderId = :id', { id: orderId })
        .orderBy('sh.createdAt', 'DESC')
        .getOne(),
      this.commentsRepository
        .createQueryBuilder('c')
        .where('c.orderId = :id', { id: orderId })
        .orderBy('c.createdAt', 'DESC')
        .getMany(),
      productIds.length
        ? this.productsRepository
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.images', 'img')
            .where('p.id IN (:...ids)', { ids: productIds })
            .getMany()
        : Promise.resolve([] as any[]),
    ])

    const stockByProductId = new Map<number, Stock>()
    for (const s of stocks as any[]) {
      const pid = Number((s as any)?.product?.id)
      if (pid) stockByProductId.set(pid, s)
    }

    const productById = new Map<number, Product>()
    for (const p of products as any[]) {
      const id = Number((p as any).id)
      if (id) productById.set(id, p as any)
    }

    const woByProductId = new Map<number, WorkOrder>()
    for (const wo of workOrders as any[]) {
      const pid = Number((wo as any).productId)
      if (pid && !woByProductId.has(pid)) woByProductId.set(pid, wo as any)
    }

    const lines = items.map((it: any) => {
      const pid = Number(it.productId)
      const st = pid ? stockByProductId.get(pid) : undefined
      const p = pid ? productById.get(pid) : undefined
      const qty = st?.qty || 0
      const reservedQty = (st as any)?.reservedQty || 0
      const available = Math.max(0, qty - reservedQty)
      const article = String((p as any)?.article || it?.article || '')
      const previewImageUrl = (p as any)?.images?.[0]?.url || null
      const wo = pid ? woByProductId.get(pid) : undefined
      const prodPlanned = wo ? Number((wo as any).qtyPlanned || 0) : 0
      const prodDone = wo ? Number((wo as any).qtyDone || 0) : 0
      const prodStatus = wo ? (wo as any).status : 'not_needed'

      return {
        productId: pid,
        article,
        name: it.name,
        previewImageUrl,
        quantity: Number(it.quantity) || 0,
        price: it.price,
        stock: { warehouse: wh, qty, reservedQty, available, onOrderQty: (st as any)?.onOrderQty || 0 },
        production: wo
          ? {
              workOrderId: (wo as any).id,
              status: prodStatus,
              qtyPlanned: String((wo as any).qtyPlanned),
              qtyDone: String((wo as any).qtyDone),
            }
          : null,
      }
    })

    const history: any[] = [
      { type: 'created', at: (order as any).createdAt, text: 'Заказ создан' },
      ...(shipment
        ? [{ type: 'shipment', at: (shipment as any).createdAt, text: `Отгрузка создана (#${(shipment as any).id})` }]
        : []),
      ...(shipment?.shippedAt
        ? [{ type: 'shipped', at: shipment.shippedAt, text: 'Отгружено' }]
        : []),
      ...tasks.map((t: any) => {
        const p = productById.get(Number(t.productId))
        const a = p?.article ? String(p.article) : ''
        const label = a ? `${a}` : `товар ${t.productId}`
        return {
          type: 'production',
          at: t.createdAt,
          text: `Производство: ${label} × ${t.qty} (${t.status})`,
        }
      }),
      ...workOrders.map((wo: any) => {
        const p = productById.get(Number(wo.productId))
        const a = p?.article ? String(p.article) : ''
        const label = a ? `${a}` : `товар ${wo.productId}`
        return {
          type: 'work_order',
          at: wo.updatedAt || wo.createdAt,
          text: `WorkOrder: ${label} ${wo.qtyDone}/${wo.qtyPlanned}${wo.qtyDefect && Number(wo.qtyDefect) > 0 ? ` (брак ${wo.qtyDefect})` : ''} (${wo.status})`,
        }
      }),
      ...comments.map((c: any) => ({ type: 'comment', at: c.createdAt, text: c.text })),
    ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())

    return {
      order: {
        id: order.id,
        status: (order as any).status,
        allocationIssues: (order as any).allocationIssues || null,
        createdAt: (order as any).createdAt,
        customerName: (order as any).customerName,
        email: (order as any).email,
        phone: (order as any).phone,
        address: (order as any).address,
        totalPrice: (order as any).totalPrice,
      },
      lines,
      productionTasks: tasks,
      workOrders,
      shipment,
      comments,
      history,
    }
  }

  // ---------- Этап 3: Аллокация резервов под заказ (FINISHED + BLANKS через BOM) ----------

  /**
   * Слой совместимости (Этап A): единая точка получения «жёстких» складов.
   * Не берём warehouseId из UI, а идём через settings.main_warehouses с fallback по code.
   */
  private async getMainWarehouse(kind: 'BLANKS' | 'FINISHED' | 'DEFECT'): Promise<Warehouse | null> {
    const kv = await this.settingsRepository.findOne({ where: { key: 'main_warehouses' } as any })
    const value = (kv?.value && typeof kv.value === 'object') ? (kv.value as any) : {}

    const mapId = {
      BLANKS: value?.blanksWarehouseId ? Number(value.blanksWarehouseId) : null,
      FINISHED: value?.finishedWarehouseId ? Number(value.finishedWarehouseId) : null,
      DEFECT: value?.defectWarehouseId ? Number(value.defectWarehouseId) : null,
    } as const

    const all = await this.warehousesRepository.find({ order: { id: 'ASC' } as any })
    const byId = new Map<number, Warehouse>()
    for (const w of all as any[]) byId.set(Number((w as any).id), w as any)

    const wantedId = mapId[kind]
    const bySetting = wantedId ? byId.get(wantedId) : null
    const byCode = all.find((w: any) => String(w.code).toUpperCase() === kind) as any
    const wh = (bySetting as any) || (byCode as any) || null

    if (wh) {
      await this.ensureWarehouse(String((wh as any).code || kind).toUpperCase())
      return (await this.warehousesRepository.findOne({ where: { code: String((wh as any).code).toUpperCase() } as any })) as any
    }

    // If absolutely nothing exists, create the required one (idempotent)
    await this.ensureWarehouse(kind)
    return (await this.warehousesRepository.findOne({ where: { code: kind } as any })) as any
  }

  private async getMainWarehouseCodes(): Promise<{
    finishedCode: string
    blanksCode: string
    defectCode: string
    finishedId: number | null
    blanksId: number | null
    defectId: number | null
  }> {
    const blanksRow = await this.getMainWarehouse('BLANKS')
    const finishedRow = await this.getMainWarehouse('FINISHED')
    const defectRow = await this.getMainWarehouse('DEFECT')

    const blanksCode = String((blanksRow as any)?.code || 'BLANKS').toUpperCase()
    const finishedCode = String((finishedRow as any)?.code || 'FINISHED').toUpperCase()
    const defectCode = String((defectRow as any)?.code || 'DEFECT').toUpperCase()

    return {
      finishedCode,
      blanksCode,
      defectCode,
      finishedId: finishedRow ? Number((finishedRow as any).id) : null,
      blanksId: blanksRow ? Number((blanksRow as any).id) : null,
      defectId: defectRow ? Number((defectRow as any).id) : null,
    }
  }

  private async adjustStockReserve(warehouseCode: string, productId: number, delta: number) {
    if (!productId || !delta) return
    const wh = String(warehouseCode || '').trim().toUpperCase()
    let stock: Stock | null = await this.stocksRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.product', 'p')
      .where('s.warehouse = :wh', { wh })
      .andWhere('p.id = :pid', { pid: productId })
      .getOne()

    if (!stock) {
      const product = await this.productsRepository.findOne({ where: { id: productId } as any })
      if (!product) return
      stock = this.stocksRepository.create({
        warehouse: wh,
        product,
        qty: 0,
        reservedQty: 0,
        onOrderQty: 0,
        minQty: 0,
      } as DeepPartial<Stock>)
    }

    if (!stock) return

    const next = Math.max(0, Number((stock as any).reservedQty || 0) + Number(delta))
    ;(stock as any).reservedQty = next
    await this.stocksRepository.save(stock)
  }

  private async releaseActiveReservations(orderId: number) {
    const rows = await this.reservationsRepository.find({ where: { orderId, status: 'active' as any } as any })
    if (!rows.length) return { released: 0 }

    for (const r of rows as any[]) {
      const wCode = String((r as any)?.warehouse?.code || '').toUpperCase()
      const pid = Number((r as any)?.product?.id || (r as any)?.productId)
      const qty = Number((r as any)?.qty || 0)
      if (wCode && pid && qty > 0) await this.adjustStockReserve(wCode, pid, -qty)
      ;(r as any).status = 'released'
    }
    await this.reservationsRepository.save(rows as any)
    return { released: rows.length }
  }

  async allocateOrder(orderId: number) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } as any })
    if (!order) throw new NotFoundException('Заказ не найден')

    // idempotency: remove previous active reservations for this order
    await this.releaseActiveReservations(orderId)

    const { finishedCode, blanksCode, finishedId, blanksId } = await this.getMainWarehouseCodes()
    if (!finishedId || !blanksId) throw new BadRequestException('Не настроены основные склады (BLANKS/FINISHED)')

    const items = Array.isArray((order as any).items) ? (order as any).items : []
    const productIds = Array.from(new Set(items.map((i: any) => Number(i?.productId)).filter(Boolean)))

    const finishedStocks = productIds.length
      ? await this.stocksRepository
          .createQueryBuilder('s')
          .leftJoinAndSelect('s.product', 'p')
          .where('s.warehouse = :wh', { wh: finishedCode })
          .andWhere('p.id IN (:...ids)', { ids: productIds })
          .getMany()
      : []

    const stockByPid = new Map<number, Stock>()
    for (const s of finishedStocks as any[]) {
      const pid = Number((s as any)?.product?.id)
      if (pid) stockByPid.set(pid, s)
    }

    const issues: any[] = []
    const created: InventoryReservation[] = []

    for (const it of items) {
      const productId = Number(it.productId)
      const need = Number(it.quantity) || 0
      if (!productId || need <= 0) continue

      // 1) Reserve FINISHED
      const st = stockByPid.get(productId)
      const availableFinished = st ? Math.max(0, Number((st as any).qty || 0) - Number((st as any).reservedQty || 0)) : 0
      const reserveFinished = Math.min(need, availableFinished)

      if (reserveFinished > 0) {
        await this.adjustStockReserve(finishedCode, productId, reserveFinished)
        created.push(
          (this.reservationsRepository.create({
          orderId,
          productId,
          warehouseId: finishedId,
          qty: String(reserveFinished),
          kind: 'FINISHED' as ReservationKind,
          status: 'active',
        } as any) as any) as InventoryReservation,
        )
      }

      const deficit = Math.max(0, need - reserveFinished)
      if (deficit <= 0) continue

      // 2) Need BLANKS through BOM
      const bom = await this.bomRepository.find({ where: { productId } as any })
      if (!bom.length) {
        issues.push({ code: 'no_bom', productId, need: deficit, message: 'Нет рецепта (BOM) для товара' })
        continue
      }

      for (const b of bom as any[]) {
        const componentId = Number((b as any).componentProductId)
        const per = Number((b as any).qty || 0) || 0
        const needBlanks = deficit * per
        if (!componentId || needBlanks <= 0) continue

        // check blanks stock
        let blankStock: Stock | null = await this.stocksRepository
          .createQueryBuilder('s')
          .leftJoinAndSelect('s.product', 'p')
          .where('s.warehouse = :wh', { wh: blanksCode })
          .andWhere('p.id = :pid', { pid: componentId })
          .getOne()

        if (!blankStock) {
          const p = await this.productsRepository.findOne({ where: { id: componentId } as any })
          if (p) {
            blankStock = this.stocksRepository.create({
              warehouse: blanksCode,
              product: p,
              qty: 0,
              reservedQty: 0,
              onOrderQty: 0,
              minQty: 0,
            } as DeepPartial<Stock>)
          }
        }

        if (!blankStock) {
          issues.push({
            code: 'not_enough_blanks',
            productId,
            componentProductId: componentId,
            need: needBlanks,
            message: 'Нет остатка заготовки на складе BLANKS',
          })
          continue
        }

        const availableBlanks = blankStock
          ? Math.max(0, Number((blankStock as any).qty || 0) - Number((blankStock as any).reservedQty || 0))
          : 0
        const reserveBlanks = Math.min(needBlanks, availableBlanks)

        if (reserveBlanks > 0) {
          await this.adjustStockReserve(blanksCode, componentId, reserveBlanks)
          created.push(
          (this.reservationsRepository.create({
            orderId,
            productId: componentId,
            warehouseId: blanksId,
            qty: String(reserveBlanks),
            kind: 'BLANKS' as ReservationKind,
            status: 'active',
          } as any) as any) as InventoryReservation,
        )
        }

        if (reserveBlanks < needBlanks) {
          issues.push({
            code: 'not_enough_blanks',
            productId,
            componentProductId: componentId,
            need: needBlanks,
            reserved: reserveBlanks,
            message: 'Не хватает заготовок на складе BLANKS',
          })
        }
      }
    }

    if (created.length) await this.reservationsRepository.save(created as any)

    ;(order as any).allocationIssues = issues.length ? issues : null
    if (issues.length) {
      ;(order as any).status = 'needs_materials'
    } else if ((order as any).status === 'new') {
      ;(order as any).status = 'confirmed'
    }
    await this.ordersRepository.save(order)

    const allocations = await this.getAllocations(orderId)
    return { ok: true, issues, ...allocations }
  }

  async getAllocations(orderId: number) {
    const rows = await this.reservationsRepository.find({ where: { orderId } as any, order: { id: 'ASC' } as any })
    return {
      allocations: rows.map((r: any) => ({
        id: r.id,
        orderId: r.orderId,
        productId: r.productId,
        product: r.product ? { id: r.product.id, name: (r.product as any).name, kind: (r.product as any).kind } : null,
        warehouseId: r.warehouseId,
        warehouse: r.warehouse ? { id: r.warehouse.id, code: r.warehouse.code, name: r.warehouse.name, type: (r.warehouse as any).type } : null,
        qty: r.qty,
        kind: r.kind,
        status: r.status,
        createdAt: r.createdAt,
      })),
    }
  }

  // ---------- Этап 5: готовность к отгрузке (только FINISHED) ----------

  private buildOrderNeedMap(order: Order) {
    const need = new Map<number, number>()
    for (const it of (order.items || []) as any[]) {
      const pid = Number((it as any)?.productId)
      const q = Math.max(0, Number((it as any)?.quantity) || 0)
      if (!pid || !q) continue
      need.set(pid, (need.get(pid) || 0) + q)
    }
    return need
  }

  private async getActiveFinishedReservationMap(orderId: number, finishedWarehouseId: number) {
    const rows = await this.reservationsRepository.find({
      where: { orderId, status: 'active' as any, kind: 'FINISHED' as any, warehouseId: finishedWarehouseId } as any,
    })
    const map = new Map<number, number>()
    for (const r of rows as any[]) {
      const pid = Number((r as any)?.product?.id || (r as any)?.productId)
      const q = Math.max(0, Number((r as any)?.qty || 0))
      if (!pid || !q) continue
      map.set(pid, (map.get(pid) || 0) + q)
    }
    return { rows, map }
  }

  private async assertOrderReadyToShip(order: Order) {
    const { finishedId } = await this.getMainWarehouseCodes()
    if (!finishedId) throw new BadRequestException('Не настроен основной склад FINISHED')

    const needMap = this.buildOrderNeedMap(order)
    const { map: reservedMap } = await this.getActiveFinishedReservationMap(Number(order.id), finishedId)

    const missing: Array<{ productId: number; need: number; reserved: number }> = []
    for (const [pid, need] of needMap.entries()) {
      const reserved = reservedMap.get(pid) || 0
      if (reserved + 1e-9 < need) missing.push({ productId: pid, need, reserved })
    }

    if (missing.length) {
      throw new BadRequestException({
        message: 'Заказ не полностью укомплектован готовой продукцией (FINISHED)',
        code: 'not_ready_to_ship',
        missing,
      } as any)
    }
  }

  private async isOrderReadyToShip(order: Order) {
    try {
      await this.assertOrderReadyToShip(order)
      return true
    } catch {
      return false
    }
  }

  private async consumeFinishedReservations(orderId: number, productId: number, qtyToConsume: number) {
    const { finishedId } = await this.getMainWarehouseCodes()
    if (!finishedId) throw new BadRequestException('Не настроен основной склад FINISHED')

    const { rows } = await this.getActiveFinishedReservationMap(orderId, finishedId)
    const relevant = (rows as any[]).filter((r) => Number((r as any)?.product?.id || (r as any)?.productId) === productId)
    let left = Math.max(0, Number(qtyToConsume) || 0)
    if (!left) return

    for (const r of relevant) {
      if (left <= 0) break
      const cur = Math.max(0, Number((r as any).qty || 0))
      const take = Math.min(cur, left)
      if (!take) continue

      if (take + 1e-9 >= cur) {
        ;(r as any).status = 'consumed'
      } else {
        // split: reduce active, create consumed
        ;(r as any).qty = String(cur - take)
        const consumed = this.reservationsRepository.create({
          orderId,
          productId,
          warehouseId: finishedId,
          qty: String(take),
          kind: 'FINISHED' as any,
          status: 'consumed',
        } as any)
        await this.reservationsRepository.save(consumed as any)
      }

      await this.reservationsRepository.save(r as any)
      left -= take
    }

    if (left > 1e-9) {
      throw new BadRequestException('Не хватает FINISHED-резервов для списания при отгрузке')
    }
  }

  async releaseAllocations(orderId: number) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } as any })
    if (!order) throw new NotFoundException('Заказ не найден')
    await this.releaseActiveReservations(orderId)
    // do not force status rollback; just clear issues
    ;(order as any).allocationIssues = null
    await this.ordersRepository.save(order)
    const allocations = await this.getAllocations(orderId)
    return { ok: true, ...allocations }
  }

  // ---------- Этап 4: Производство (Work Orders + выпуск) ----------

  private async consumeReservationQty(
    res: InventoryReservation,
    consumeQty: number,
    blanksCode: string,
    userId?: number | null,
    note?: string,
    orderId?: number | null,
    workOrderId?: number | null,
  ) {
    const current = Number((res as any).qty || 0)
    const q = Math.max(0, Math.min(current, consumeQty))
    if (!q) return { consumed: 0 }

    // уменьшаем резерв на складе заготовок
    await this.adjustStockReserve(blanksCode, Number((res as any).productId), -q)
    // списываем фактический остаток
    await this.issueStock(blanksCode, Number((res as any).productId), q, note, userId || null, orderId ?? null, workOrderId ?? null)

    if (q >= current - 1e-9) {
      ;(res as any).status = 'consumed'
      await this.reservationsRepository.save(res as any)
      return { consumed: q }
    }

    // partial: split
    ;(res as any).qty = String(current - q)
    await this.reservationsRepository.save(res as any)
    const consumedRow = this.reservationsRepository.create({
      orderId: (res as any).orderId,
      productId: (res as any).productId,
      warehouseId: (res as any).warehouseId,
      qty: String(q),
      kind: (res as any).kind,
      status: 'consumed',
    } as any)
    await this.reservationsRepository.save(consumedRow as any)
    return { consumed: q }
  }

  private async productionOutput(orderId: number, finishedProductId: number, qty: number, userId?: number | null, workOrderId?: number) {
    const q = Math.max(0, Number(qty) || 0)
    if (!q) return
    const { finishedCode, blanksCode, finishedId, blanksId } = await this.getMainWarehouseCodes()
    if (!finishedId || !blanksId) throw new BadRequestException('Не настроены основные склады (BLANKS/FINISHED)')

    // 1) consume BLANKS reservations via BOM
    const bom = await this.bomRepository.find({ where: { productId: finishedProductId } as any })
    if (!bom.length) throw new BadRequestException('Нельзя выпустить: у товара нет BOM (рецепта)')

    for (const b of bom as any[]) {
      const componentId = Number((b as any).componentProductId)
      const per = Number((b as any).qty || 0)
      const need = q * per
      if (!componentId || need <= 0) continue

      let remaining = need
      const rows = await this.reservationsRepository.find({
        where: { orderId, productId: componentId, kind: 'BLANKS' as any, status: 'active' as any } as any,
        order: { id: 'ASC' } as any,
      })

      const note = `WO#${workOrderId || ''} · OUTPUT for order#${orderId}`.trim()
      for (const r of rows as any[]) {
        if (remaining <= 0) break
        const consumed = await this.consumeReservationQty(r as any, remaining, blanksCode, userId || null, note, orderId, workOrderId || null)
        remaining -= Number(consumed.consumed || 0)
      }

      if (remaining > 1e-9) {
        throw new BadRequestException('Недостаточно зарезервированных заготовок (BLANKS) для выпуска')
      }
    }

    // 2) receive finished stock
    await this.receiveStock(finishedCode, finishedProductId, q, `WO#${workOrderId || ''} · OUTPUT`, userId || null, orderId, workOrderId || null)

    // 3) re-allocate order to reserve newly produced finished (and re-check remaining)
    await this.allocateOrder(orderId)
  }

  // Этап 6: выпуск в брак (DEFECT)
  // - списывает/consumed резервы BLANKS через BOM
  // - делает приход в DEFECT (чтобы видеть потери)
  // - переаллокация заказа (чтобы добрать недостающее, если есть заготовки)
  private async productionDefectOutput(orderId: number, finishedProductId: number, qty: number, userId?: number | null, workOrderId?: number) {
    const q = Math.max(0, Number(qty) || 0)
    if (!q) return
    const { defectCode, blanksCode, blanksId } = await this.getMainWarehouseCodes()
    if (!blanksId) throw new BadRequestException('Не настроен основной склад BLANKS')

    const bom = await this.bomRepository.find({ where: { productId: finishedProductId } as any })
    if (!bom.length) throw new BadRequestException('Нельзя списать в брак: у товара нет BOM (рецепта)')

    for (const b of bom as any[]) {
      const componentId = Number((b as any).componentProductId)
      const per = Number((b as any).qty || 0)
      const need = q * per
      if (!componentId || need <= 0) continue

      let remaining = need
      const rows = await this.reservationsRepository.find({
        where: { orderId, productId: componentId, kind: 'BLANKS' as any, status: 'active' as any } as any,
        order: { id: 'ASC' } as any,
      })

      const note = `WO#${workOrderId || ''} · DEFECT for order#${orderId}`.trim()
      for (const r of rows as any[]) {
        if (remaining <= 0) break
        const consumed = await this.consumeReservationQty(r as any, remaining, blanksCode, userId || null, note, orderId, workOrderId || null)
        remaining -= Number(consumed.consumed || 0)
      }

      if (remaining > 1e-9) {
        throw new BadRequestException('Недостаточно зарезервированных заготовок (BLANKS) для списания в брак')
      }
    }

    // фиксируем потери (приход на склад брака)
    await this.receiveStock(defectCode, finishedProductId, q, `WO#${workOrderId || ''} · DEFECT`, userId || null, orderId, workOrderId || null)

    // переаллокация, чтобы добрать недостающее (если возможно)
    await this.allocateOrder(orderId)
  }

  async createWorkOrdersFromOrder(orderId: number) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } as any })
    if (!order) throw new NotFoundException('Заказ не найден')

    const items = Array.isArray((order as any).items) ? (order as any).items : []
    const want = new Map<number, number>()
    for (const it of items) {
      const pid = Number(it?.productId)
      const qty = Number(it?.quantity || 0)
      if (pid && qty > 0) want.set(pid, (want.get(pid) || 0) + qty)
    }

    const finishedRes = await this.reservationsRepository.find({
      where: { orderId, kind: 'FINISHED' as any, status: 'active' as any } as any,
    })
    const reservedFinishedByPid = new Map<number, number>()
    for (const r of finishedRes as any[]) {
      const pid = Number((r as any).productId)
      const q = Number((r as any).qty || 0)
      if (pid && q) reservedFinishedByPid.set(pid, (reservedFinishedByPid.get(pid) || 0) + q)
    }

    const createdOrUpdated: WorkOrder[] = []
    for (const [pid, needQty] of want.entries()) {
      const reserved = reservedFinishedByPid.get(pid) || 0
      const deficit = Math.max(0, needQty - reserved)
      if (deficit <= 0) continue

      // ensure BOM exists (otherwise we can't produce)
      const bom = await this.bomRepository.find({ where: { productId: pid } as any })
      if (!bom.length) continue

      let wo = await this.workOrdersRepository.findOne({ where: { orderId, productId: pid } as any })
      if (!wo) {
        wo = ((this.workOrdersRepository.create({
          orderId,
          productId: pid,
          qtyPlanned: String(deficit),
          qtyDone: '0',
          qtyDefect: '0',
          status: 'planned' as WorkOrderStatus,
        } as any) as any) as WorkOrder)
      } else {
        const done = Number((wo as any).qtyDone || 0)
        const defect = Number((wo as any).qtyDefect || 0)
        ;(wo as any).qtyPlanned = String(Math.max(done, deficit))
        // Если WO был done, но потребность выросла, вернём в planned.
        if ((wo as any).status === 'done' && done < deficit) (wo as any).status = 'planned'
        // qtyDefect не влияет на qtyPlanned напрямую, но учитываем, что часть могла уйти в брак
        // и WO всё ещё может быть in_progress.
        if ((wo as any).status === 'done' && (done + defect) < deficit) (wo as any).status = 'planned'
      }
      createdOrUpdated.push(wo)
    }

    if (createdOrUpdated.length) await this.workOrdersRepository.save(createdOrUpdated as any)
    return this.listWorkOrders({ orderId: String(orderId) })
  }

  async listWorkOrders(params: { status?: string; orderId?: string; q?: string }) {
    const qb = this.workOrdersRepository
      .createQueryBuilder('wo')
      .leftJoin(Product, 'p', 'p.id = wo.productId')
      .select([
        'wo.id AS id',
        'wo.orderId AS orderId',
        'wo.productId AS productId',
        'wo.qtyPlanned AS qtyPlanned',
        'wo.qtyDone AS qtyDone',
        'wo.qtyDefect AS qtyDefect',
        'wo.status AS status',
        'wo.createdAt AS createdAt',
        'wo.updatedAt AS updatedAt',
        'p.name AS productName',
        'p.kind AS productKind',
      ])

    if (params.status && params.status !== 'all') qb.andWhere('wo.status = :st', { st: params.status })
    if (params.orderId) qb.andWhere('wo.orderId = :oid', { oid: Number(params.orderId) })
    if (params.q) {
      const qq = `%${String(params.q).trim()}%`
      qb.andWhere('(p.name ILIKE :q OR CAST(wo.orderId AS TEXT) ILIKE :q OR CAST(wo.id AS TEXT) ILIKE :q)', { q: qq })
    }

    qb.orderBy('wo.updatedAt', 'DESC')
    const rows = await qb.getRawMany<any>()
    return {
      workOrders: rows.map((r) => ({
        id: Number(r.id),
        orderId: Number(r.orderid ?? r.orderId),
        productId: Number(r.productid ?? r.productId),
        product: { id: Number(r.productid ?? r.productId), name: r.productname ?? r.productName, kind: r.productkind ?? r.productKind },
        qtyPlanned: String(r.qtyplanned ?? r.qtyPlanned),
        qtyDone: String(r.qtydone ?? r.qtyDone),
        qtyDefect: String(r.qtydefect ?? r.qtyDefect ?? '0'),
        status: String(r.status),
        createdAt: r.createdat ?? r.createdAt,
        updatedAt: r.updatedat ?? r.updatedAt,
      })),
    }
  }

  async startWorkOrder(woId: number, userId?: number | null) {
    const wo = await this.workOrdersRepository.findOne({ where: { id: woId } as any })
    if (!wo) throw new NotFoundException('WorkOrder not found')
    if ((wo as any).status === 'done') return { workOrder: wo }
    ;(wo as any).status = 'in_progress'
    await this.workOrdersRepository.save(wo as any)
    return { workOrder: wo }
  }

  async completeWorkOrder(woId: number, qty: number, userId?: number | null) {
    const wo = await this.workOrdersRepository.findOne({ where: { id: woId } as any })
    if (!wo) throw new NotFoundException('WorkOrder not found')

    const q = Math.max(0, Number(qty) || 0)
    if (!q) throw new BadRequestException('qty must be > 0')

    const planned = Number((wo as any).qtyPlanned || 0)
    const done = Number((wo as any).qtyDone || 0)
    const defect = Number((wo as any).qtyDefect || 0)
    const remainingProcess = Math.max(0, planned - (done + defect))
    const produce = Math.min(q, remainingProcess)
    if (!produce) return { workOrder: wo }

    // perform output movements + consume blanks
    await this.productionOutput((wo as any).orderId, (wo as any).productId, produce, userId || null, woId)

    const newDone = done + produce
    ;(wo as any).qtyDone = String(newDone)
    if (newDone + 1e-9 >= planned) {
      ;(wo as any).status = 'done'
    } else {
      ;(wo as any).status = 'in_progress'
    }
    await this.workOrdersRepository.save(wo as any)

    return { workOrder: wo, ...(await this.getAllocations((wo as any).orderId)) }
  }

  async defectWorkOrder(woId: number, qty: number, userId?: number | null) {
    const wo = await this.workOrdersRepository.findOne({ where: { id: woId } as any })
    if (!wo) throw new NotFoundException('WorkOrder not found')

    const q = Math.max(0, Number(qty) || 0)
    if (!q) throw new BadRequestException('qty must be > 0')

    const planned = Number((wo as any).qtyPlanned || 0)
    const done = Number((wo as any).qtyDone || 0)
    const defect = Number((wo as any).qtyDefect || 0)
    const remainingProcess = Math.max(0, planned - (done + defect))
    const scrap = Math.min(q, remainingProcess)
    if (!scrap) return { workOrder: wo }

    await this.productionDefectOutput((wo as any).orderId, (wo as any).productId, scrap, userId || null, woId)

    const newDefect = defect + scrap
    ;(wo as any).qtyDefect = String(newDefect)
    // статус остаётся in_progress, потому что брак не закрывает план
    if ((wo as any).status === 'planned') (wo as any).status = 'in_progress'
    await this.workOrdersRepository.save(wo as any)

    return { workOrder: wo, ...(await this.getAllocations((wo as any).orderId)) }
  }

  async acceptOrder(orderId: number, warehouse = OpsService.DEFAULT_WAREHOUSE) {
    // Исторически accept резервировал готовую продукцию. Начиная с Этапа 3
    // мы используем единый аллокатор (FG + BLANKS через BOM).
    await this.allocateOrder(orderId)

    const wh = String(warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    await this.ensureWarehouse(wh)
    return this.getOrder(orderId, wh)
  }

  async cancelOrder(orderId: number) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } as any })
    if (!order) throw new NotFoundException('Заказ не найден')
    ;(order as any).status = 'closed'
    ;(order as any).closedAt = new Date()
    await this.ordersRepository.save(order)
    return { ok: true }
  }

  // Опасно: физическое удаление заказа и связанных сущностей.
  // Используется для чистки тестовых данных. Производственные/складские движения не трогаем.
  async deleteOrderHard(orderId: number, userId: number | null = null) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } as any })
    if (!order) throw new NotFoundException('Заказ не найден')

    // сначала снимаем активные резервы, чтобы не оставить reserved в stock
    try {
      await this.releaseAllocations(orderId)
    } catch {
      // если release не прошёл (например, всё уже снято) — всё равно идём дальше
    }

    // удаляем зависимые записи
    await Promise.all([
      this.commentsRepository.delete({ orderId } as any),
      this.shipmentsRepository.delete({ orderId } as any),
      this.workOrdersRepository.delete({ orderId } as any),
      this.reservationsRepository.delete({ orderId } as any),
    ])

    await this.ordersRepository.delete({ id: orderId } as any)

    // запись в системный лог (мягко)
    try {
      await this.systemEventsRepository.save(
        this.systemEventsRepository.create({
          type: 'order.delete',
          payload: { orderId, byUserId: userId },
        } as any),
      )
    } catch {
      // ignore
    }

    return { ok: true }
  }

  async createProductionForDeficit(orderId: number, warehouse = OpsService.DEFAULT_WAREHOUSE) {
    // Legacy endpoint (Stage 1/2/3) kept for compatibility.
    // Starting from Stage 4 we use Work Orders.
    await this.createWorkOrdersFromOrder(orderId)
    const wh = String(warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    await this.ensureWarehouse(wh)
    return this.getOrder(orderId, wh)
  }

  async createShipment(orderId: number) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } as any })
    if (!order) throw new NotFoundException('Заказ не найден')

    // Этап 5: нельзя создать отгрузку, если заказ не полностью укомплектован готовой продукцией
    await this.assertOrderReadyToShip(order)

    const existing = await this.shipmentsRepository
      .createQueryBuilder('sh')
      .where('sh.orderId = :id', { id: orderId })
      .orderBy('sh.createdAt', 'DESC')
      .getOne()

    if (existing) {
      if ((existing as any).status === 'created') (existing as any).status = 'ready'
      return { shipment: existing }
    }

    const shipment = this.shipmentsRepository.create({
      orderId,
      status: 'ready' as any,
      plannedAt: null,
      shippedAt: null,
      deliveredAt: null,
      confirmedByUserId: null,
      waybillNumber: null,
      comment: null,
      photoUrl: null,
      shippedItems: null,
    })
    await this.shipmentsRepository.save(shipment)
    return { shipment }
  }

  async confirmShipped(orderId: number) {
    // legacy shortcut: confirm "ship" by orderId
    const order = await this.ordersRepository.findOne({ where: { id: orderId } as any })
    if (!order) throw new NotFoundException('Заказ не найден')

    // Этап 5: ship возможен только если FINISHED reserved == required
    await this.assertOrderReadyToShip(order)

    let sh: Shipment | null = await this.shipmentsRepository
      .createQueryBuilder('sh')
      .where('sh.orderId = :id', { id: orderId })
      .orderBy('sh.createdAt', 'DESC')
      .getOne()

    if (!sh) {
      const created = this.shipmentsRepository.create({ orderId, status: 'ready' as any } as DeepPartial<Shipment>)
      sh = await this.shipmentsRepository.save(created)
    }

    const res = await this.confirmShipmentById(Number((sh as any).id), { shippedAt: new Date().toISOString() })
    return { ok: true, shippedAt: (res as any)?.shipment?.shippedAt }
  }

  // ---------- Shipments (Этап 4: отгрузки) ----------

  private normalizeShipmentStatus(s: any): any {
    if (!s) return s
    if (s.status === 'created') s.status = 'ready'
    return s
  }

  async listShipments(params: {
    dateFrom?: string
    dateTo?: string
    status?: string
    store?: string
  }) {
    const qb = this.shipmentsRepository.createQueryBuilder('sh').orderBy('sh.createdAt', 'DESC')

    if (params.dateFrom) qb.andWhere('sh.createdAt >= :df', { df: new Date(params.dateFrom) })
    if (params.dateTo) qb.andWhere('sh.createdAt <= :dt', { dt: new Date(params.dateTo) })

    const st = String(params.status || '').trim().toLowerCase()
    if (st && st !== 'all') {
      qb.andWhere('LOWER(sh.status) = :st', { st })
    }

    const shipments = (await qb.getMany()).map((s) => this.normalizeShipmentStatus(s))

    const orderIds = Array.from(new Set(shipments.map((s) => Number((s as any).orderId)).filter(Boolean)))
    const orders = orderIds.length
      ? await this.ordersRepository.find({ where: { id: In(orderIds) } as any })
      : []
    const orderById = new Map<number, Order>()
    for (const o of orders) orderById.set(Number(o.id), o)

    // Этап 5: определяем, какие заказы полностью укомплектованы FINISHED
    const { finishedId } = await this.getMainWarehouseCodes()
    const readyOrderIds = new Set<number>()
    if (finishedId && orders.length) {
      const needByOrder = new Map<number, Map<number, number>>()
      for (const o of orders as any[]) {
        needByOrder.set(Number(o.id), this.buildOrderNeedMap(o as any))
      }

      const resRows = await this.reservationsRepository
        .createQueryBuilder('r')
        .select('r.orderId', 'orderId')
        .addSelect('r.productId', 'productId')
        .addSelect('SUM(r.qty)::float', 'qty')
        .where('r.status = :st', { st: 'active' })
        .andWhere('r.kind = :k', { k: 'FINISHED' })
        .andWhere('r.warehouseId = :wid', { wid: finishedId })
        .andWhere('r.orderId IN (:...ids)', { ids: orderIds })
        .groupBy('r.orderId')
        .addGroupBy('r.productId')
        .getRawMany<{ orderId: string; productId: string; qty: string }>()

      const reservedByOrder = new Map<number, Map<number, number>>()
      for (const rr of resRows) {
        const oid = Number((rr as any).orderId)
        const pid = Number((rr as any).productId)
        const q = Math.max(0, Number((rr as any).qty || 0))
        if (!oid || !pid) continue
        if (!reservedByOrder.get(oid)) reservedByOrder.set(oid, new Map())
        reservedByOrder.get(oid)!.set(pid, q)
      }

      for (const o of orders as any[]) {
        const oid = Number(o.id)
        const needMap = needByOrder.get(oid) || new Map()
        const rmap = reservedByOrder.get(oid) || new Map()
        const ok = Array.from(needMap.entries()).every(([pid, need]) => (rmap.get(pid) || 0) + 1e-9 >= need)
        if (ok) readyOrderIds.add(oid)
      }
    }

    // Optional: store filter (пока в базе нет магазина, оставляем как "Сайт")
    const storeFilter = String(params.store || '').trim()

    const userIds = Array.from(
      new Set(shipments.map((s: any) => Number(s.confirmedByUserId)).filter(Boolean)),
    )
    const users = userIds.length ? await this.usersRepository.find({ where: { id: In(userIds) } as any }) : []
    const userById = new Map<number, User>()
    for (const u of users) userById.set(Number(u.id), u)

    const rows = shipments
      .map((sh: any) => {
        const order = orderById.get(Number(sh.orderId))
        if (!order) return null

        // Этап 5: в списке "Отгрузки" показываем только полностью готовые (для статуса ready)
        const sst = String(sh.status || '').toLowerCase()
        if ((sst === 'ready' || sst === 'created') && !readyOrderIds.has(Number(order.id))) return null
        const confirmer = sh.confirmedByUserId ? userById.get(Number(sh.confirmedByUserId)) : null

        const shippedItems = (sh.shippedItems || {}) as Record<string, number>
        const totalQty = (order.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0)
        const shippedQty = Object.values(shippedItems).reduce((sum, v) => sum + (Number(v) || 0), 0)

        const storeName = 'Сайт'
        if (storeFilter && storeFilter !== 'all' && storeFilter !== storeName) return null

        return {
          id: sh.id,
          orderId: order.id,
          recipient: {
            name: order.customerName,
            phone: order.phone,
            email: order.email,
            address: order.address,
          },
          store: storeName,
          status: sh.status,
          plannedAt: sh.plannedAt,
          shippedAt: sh.shippedAt,
          deliveredAt: sh.deliveredAt,
          confirmedBy: confirmer ? { id: confirmer.id, name: confirmer.name, email: confirmer.email } : null,
          waybillNumber: sh.waybillNumber,
          comment: sh.comment,
          photoUrl: sh.photoUrl,
          shippedItems: sh.shippedItems,
          shippedProgress: { shippedQty, totalQty },
          orderStatus: (order as any).status,
          orderTotalPrice: order.totalPrice,
          orderCreatedAt: order.createdAt,
        }
      })
      .filter(Boolean)

    // apply readiness filter for ready shipments (async)
    const filtered: any[] = []
    for (const r of rows as any[]) {
      const sst = String(r.status || '').toLowerCase()
      if (sst === 'ready' || sst === 'created') {
        const o = orderById.get(Number(r.orderId))
        if (!o) continue
        const ok = await this.isOrderReadyToShip(o)
        if (!ok) continue
      }
      filtered.push(r)
    }

    return { shipments: filtered }
  }

  private computeIsFullyShipped(order: Order, shippedItems: Record<string, number>) {
    const needMap = new Map<number, number>()
    for (const it of order.items || []) needMap.set(Number(it.productId), Math.max(0, Number(it.quantity) || 0))
    for (const [k, v] of Object.entries(shippedItems || {})) {
      const pid = Number(k)
      if (!pid) continue
      const need = needMap.get(pid) || 0
      needMap.set(pid, Math.max(0, need - (Number(v) || 0)))
    }
    return Array.from(needMap.values()).every((n) => n <= 0)
  }

  private async shipOrderPartial(order: Order, warehouse: string, itemsToShip: Record<string, number>) {
    // Этап 5: отгружаем ТОЛЬКО из склада FINISHED
    const { finishedCode } = await this.getMainWarehouseCodes()
    const wh = String(finishedCode || warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    for (const [k, qtyRaw] of Object.entries(itemsToShip || {})) {
      const productId = Number(k)
      const qty = Math.max(0, Number(qtyRaw) || 0)
      if (!productId || !qty) continue

      const stock = await this.stocksRepository.findOne({
        where: { warehouse: wh, product: { id: productId } } as any,
      })
      if (!stock) throw new BadRequestException('Not reserved')
      if ((stock.reservedQty || 0) < qty) throw new BadRequestException('Not enough reserved stock to ship')

      // Отгрузка должна уменьшать и резерв, и фактический остаток.
      // Резервирование (reserve) не меняет qty, поэтому при отгрузке списываем qty.
      if ((stock.qty || 0) < qty) throw new BadRequestException('Not enough stock qty to ship')

      stock.reservedQty -= qty
      stock.qty -= qty
      await this.stocksRepository.save(stock)
      await this.movementsRepository.save(
        this.movementsRepository.create({
          warehouse: wh,
          productId,
          type: 'out',
          qty,
          orderId: order.id,
          note: null,
        }),
      )
    }
  }

  async confirmShipmentById(
    shipmentId: number,
    input: {
      shippedAt?: string
      comment?: string
      waybillNumber?: string
      photoUrl?: string
      warehouse?: string
      confirmedByUserId?: number
    },
  ) {
    const sh = await this.shipmentsRepository.findOne({ where: { id: shipmentId } as any })
    if (!sh) throw new NotFoundException('Shipment not found')
    this.normalizeShipmentStatus(sh as any)

    const order = await this.ordersRepository.findOne({ where: { id: (sh as any).orderId } as any })
    if (!order) throw new NotFoundException('Заказ не найден')

    // Этап 5: подтверждать отгрузку можно только когда заказ полностью укомплектован готовой продукцией
    await this.assertOrderReadyToShip(order)

    const shippedAt = input.shippedAt ? new Date(input.shippedAt) : new Date()
    ;(sh as any).status = 'shipped'
    ;(sh as any).shippedAt = shippedAt
    ;(sh as any).comment = typeof input.comment === 'undefined' ? (sh as any).comment : String(input.comment || '').trim() || null
    ;(sh as any).waybillNumber = typeof input.waybillNumber === 'undefined' ? (sh as any).waybillNumber : String(input.waybillNumber || '').trim() || null
    ;(sh as any).photoUrl = typeof input.photoUrl === 'undefined' ? (sh as any).photoUrl : String(input.photoUrl || '').trim() || null
    ;(sh as any).confirmedByUserId = input.confirmedByUserId || (sh as any).confirmedByUserId || null

    // Этап 5: частичная отгрузка запрещена (нельзя "отгрузить воздух" и усложнять резервы)
    const shippedItemsExisting = ((sh as any).shippedItems || {}) as Record<string, number>
    if (Object.keys(shippedItemsExisting).length) {
      throw new BadRequestException('Частичная отгрузка отключена: отгружаем только полностью готовые заказы')
    }

    // ship the whole order
    const shippedItems = ((sh as any).shippedItems || {}) as Record<string, number>
    const toShipNow: Record<string, number> = {}
    for (const it of order.items || []) {
      const pid = Number(it.productId)
      const need = Math.max(0, Number(it.quantity) || 0)
      const already = Math.max(0, Number(shippedItems[String(pid)] || 0))
      const rest = Math.max(0, need - already)
      if (rest > 0) toShipNow[String(pid)] = rest
    }

    // Отгружаем строго из FINISHED
    const { finishedCode } = await this.getMainWarehouseCodes()
    await this.ensureWarehouse(finishedCode || OpsService.DEFAULT_WAREHOUSE)
    await this.shipOrderPartial(order, finishedCode || OpsService.DEFAULT_WAREHOUSE, toShipNow)

    // Резервы FINISHED -> consumed (строго под заказ)
    for (const [k, v] of Object.entries(toShipNow)) {
      const pid = Number(k)
      const qty = Math.max(0, Number(v) || 0)
      if (pid && qty) await this.consumeFinishedReservations(Number(order.id), pid, qty)
    }

    // mark all as shipped
    for (const [k, v] of Object.entries(toShipNow)) {
      shippedItems[k] = (Number(shippedItems[k]) || 0) + (Number(v) || 0)
    }
    ;(sh as any).shippedItems = shippedItems

    await this.shipmentsRepository.save(sh as any)

    ;(order as any).status = 'shipped'
    ;(order as any).shippedAt = shippedAt
    await this.ordersRepository.save(order)

    return { ok: true, shipment: sh }
  }

  // ----- Этап B: Backoffice «ремонт» данных (создание отсутствующих stock) -----

  async repairMissingStocksForAllProducts() {
    const products = await this.productsRepository.find({ order: { id: 'ASC' } as any })
    let created = 0

    // ensure main warehouse codes exist (bootstrap should have created them)
    await this.ensureWarehouse(WAREHOUSE_CODES.BLANKS)
    await this.ensureWarehouse(WAREHOUSE_CODES.FINISHED)

    const toCreate: DeepPartial<Stock>[] = []

    for (const p of products as any[]) {
      const kind = (p as any).kind === 'blank' ? 'blank' : 'finished'
      const wh = kind === 'blank' ? WAREHOUSE_CODES.BLANKS : WAREHOUSE_CODES.FINISHED

      const exists = await this.stocksRepository.findOne({
        where: { warehouse: wh, product: { id: Number((p as any).id) } } as any,
      })
      if (exists) continue

      toCreate.push({
        warehouse: wh,
        product: p as any,
        qty: 0,
        reservedQty: 0,
        onOrderQty: 0,
        minQty: 0,
      })
    }

    // bulk insert in chunks (TypeORM save with relations)
    const chunkSize = 200
    for (let i = 0; i < toCreate.length; i += chunkSize) {
      const chunk = toCreate.slice(i, i + chunkSize)
      const rows = chunk.map((c) => this.stocksRepository.create(c))
      await this.stocksRepository.save(rows)
      created += rows.length
    }

    this.logger.log(`repairMissingStocks: scanned=${products.length}, created=${created}`)
    return { scanned: products.length, created }
  }

  // ----- Этап C: контролируемое удаление старых складов -----

  /**
   * Быстрый отчёт: какие legacy-склады ещё используются в stock / reservations / movements.
   * Legacy склад = любой warehouse.code, который НЕ входит в {BLANKS, FINISHED, DEFECT}.
   */
  async legacyWarehousesReport() {
    const mainCodes = new Set<string>([WAREHOUSE_CODES.BLANKS, WAREHOUSE_CODES.FINISHED, WAREHOUSE_CODES.DEFECT])
    const warehouses = await this.warehousesRepository.find({ order: { id: 'ASC' } as any })
    const legacy = (warehouses as any[]).filter((w) => !mainCodes.has(String(w.code || '').toUpperCase()))

    const report: any[] = []
    for (const w of legacy) {
      const code = String(w.code || '').toUpperCase()
      const stocksCount = await this.stocksRepository.count({ where: { warehouse: code } as any })
      const movementsCount = await this.movementsRepository.count({ where: { warehouse: code } as any })
      const reservationsCount = await this.reservationsRepository.count({ where: { warehouseId: Number(w.id) } as any })
      report.push({ id: Number(w.id), code, type: (w as any).type, name: (w as any).name, stocksCount, reservationsCount, movementsCount })
    }

    // aggregate counters
    const totals = report.reduce(
      (acc, r) => {
        acc.legacyWarehouses += 1
        acc.stocks += Number(r.stocksCount || 0)
        acc.reservations += Number(r.reservationsCount || 0)
        acc.movements += Number(r.movementsCount || 0)
        return acc
      },
      { legacyWarehouses: 0, stocks: 0, reservations: 0, movements: 0 },
    )

    return { totals, legacy: report }
  }

  /**
   * Миграция данных legacy-складов в 3 главных склада с созданием движений migration_in.
   * - stocks старых складов переносятся и суммируются в BLANKS/FINISHED по product.kind
   * - inventory_reservations переводятся на главные склады (по kind) и помечаются released
   * - legacy-warehouses удаляются после того, как не осталось ссылок
   */
  async migrateAndRemoveLegacyWarehouses(options?: { dryRun?: boolean }) {
    const dryRun = !!options?.dryRun

    const mainCodes = new Set<string>([WAREHOUSE_CODES.BLANKS, WAREHOUSE_CODES.FINISHED, WAREHOUSE_CODES.DEFECT])
    // ensure main warehouses exist
    await this.ensureWarehouse(WAREHOUSE_CODES.BLANKS)
    await this.ensureWarehouse(WAREHOUSE_CODES.FINISHED)
    await this.ensureWarehouse(WAREHOUSE_CODES.DEFECT)

    const mainWhByCode = new Map<string, Warehouse>()
    for (const c of [WAREHOUSE_CODES.BLANKS, WAREHOUSE_CODES.FINISHED, WAREHOUSE_CODES.DEFECT] as const) {
      const w = await this.warehousesRepository.findOne({ where: { code: c } as any })
      if (w) mainWhByCode.set(c, w)
    }
    const blanksWh = mainWhByCode.get(WAREHOUSE_CODES.BLANKS)!
    const finishedWh = mainWhByCode.get(WAREHOUSE_CODES.FINISHED)!

    const warehouses = await this.warehousesRepository.find({ order: { id: 'ASC' } as any })
    const legacy = (warehouses as any[]).filter((w) => !mainCodes.has(String(w.code || '').toUpperCase()))

    let movedStockRows = 0
    let movedQty = 0
    let releasedReservations = 0
    let migratedReservations = 0
    let deletedWarehouses = 0

    // 1) migrate stocks
    for (const w of legacy) {
      const legacyCode = String((w as any).code || '').toUpperCase()
      const rows = await this.stocksRepository.find({ where: { warehouse: legacyCode } as any })
      for (const s of rows as any[]) {
        const product = (s as any).product
        const productId = Number(product?.id)
        const qty = Number((s as any).qty || 0)
        const reserved = Number((s as any).reservedQty || 0)
        const onOrder = Number((s as any).onOrderQty || 0)
        const minQty = Number((s as any).minQty || 0)

        const targetCode = (product as any)?.kind === 'blank' ? WAREHOUSE_CODES.BLANKS : WAREHOUSE_CODES.FINISHED

        // upsert target stock
        let target = await this.stocksRepository.findOne({ where: { warehouse: targetCode, product: { id: productId } } as any })
        if (!target) {
          target = this.stocksRepository.create({
            warehouse: targetCode,
            product,
            qty: 0,
            reservedQty: 0,
            onOrderQty: 0,
            minQty: 0,
          })
        }

        ;(target as any).qty = Number((target as any).qty || 0) + qty
        ;(target as any).reservedQty = Number((target as any).reservedQty || 0) + reserved
        ;(target as any).onOrderQty = Number((target as any).onOrderQty || 0) + onOrder
        ;(target as any).minQty = Math.max(Number((target as any).minQty || 0), minQty)

        if (!dryRun) {
          await this.stocksRepository.save(target as any)
          if (qty) {
            await this.movementsRepository.save(
              this.movementsRepository.create({
                warehouse: targetCode,
                productId,
                type: 'migration_in' as any,
                qty,
                orderId: null,
                userId: null,
                note: `MIGRATION FROM ${legacyCode}`,
              } as any),
            )
          }
          // delete legacy stock row
          await this.stocksRepository.delete({ id: Number((s as any).id) } as any)
        }

        movedStockRows += 1
        movedQty += qty
      }
    }

    // 2) migrate/release reservations so we can safely delete warehouses
    for (const w of legacy) {
      const legacyId = Number((w as any).id)
      const rows = await this.reservationsRepository.find({ where: { warehouseId: legacyId } as any })
      for (const r of rows as any[]) {
        const kind = String((r as any).kind || 'FINISHED').toUpperCase()
        const targetWh = kind === 'BLANKS' ? blanksWh : finishedWh

        if (String((r as any).status || 'active') === 'active') {
          ;(r as any).status = 'released'
          releasedReservations += 1
        }
        ;(r as any).warehouseId = Number((targetWh as any).id)
        ;(r as any).warehouse = targetWh
        migratedReservations += 1
      }
      if (!dryRun && (rows as any[]).length) await this.reservationsRepository.save(rows as any)
    }

    // 3) delete legacy warehouses (after reservations moved)
    for (const w of legacy) {
      const id = Number((w as any).id)
      if (!dryRun) await this.warehousesRepository.delete({ id } as any)
      deletedWarehouses += 1
    }

    // 4) safety: recompute reservedQty from active reservations for main warehouses
    if (!dryRun) {
      await this.recomputeReservedQtyForWarehouse(WAREHOUSE_CODES.BLANKS)
      await this.recomputeReservedQtyForWarehouse(WAREHOUSE_CODES.FINISHED)
    }

    return {
      dryRun,
      legacyWarehouses: legacy.map((w) => ({ id: Number((w as any).id), code: String((w as any).code || '').toUpperCase() })),
      movedStockRows,
      movedQty,
      releasedReservations,
      migratedReservations,
      deletedWarehouses,
    }
  }

  private async recomputeReservedQtyForWarehouse(warehouseCode: string) {
    const wh = String(warehouseCode || '').toUpperCase()
    const active = await this.reservationsRepository.find({ where: { status: 'active' as any } as any })
    const sumByProduct = new Map<number, number>()
    for (const r of active as any[]) {
      const wcode = String((r as any).warehouse?.code || '').toUpperCase()
      if (wcode !== wh) continue
      const pid = Number((r as any).productId)
      const qty = Number((r as any).qty || 0)
      sumByProduct.set(pid, (sumByProduct.get(pid) || 0) + qty)
    }

    const stocks = await this.stocksRepository.find({ where: { warehouse: wh } as any })
    for (const s of stocks as any[]) {
      const pid = Number((s as any).product?.id)
      ;(s as any).reservedQty = Math.max(0, Math.floor(sumByProduct.get(pid) || 0))
    }
    await this.stocksRepository.save(stocks as any)
  }

  async partialShipmentById(
    shipmentId: number,
    input: {
      items: Array<{ productId: number; qty: number }>
      shippedAt?: string
      comment?: string
      waybillNumber?: string
      photoUrl?: string
      warehouse?: string
      confirmedByUserId?: number
    },
  ) {
    // Этап 5: частичная отгрузка отключена — показываем только полностью готовые
    throw new BadRequestException('Частичная отгрузка отключена: отгружаем только полностью готовые заказы')
  }

  async setShipmentStatus(
    shipmentId: number,
    status: 'ready' | 'partial' | 'shipped' | 'delivered',
    confirmedByUserId?: number,
  ) {
    const sh = await this.shipmentsRepository.findOne({ where: { id: shipmentId } as any })
    if (!sh) throw new NotFoundException('Shipment not found')
    this.normalizeShipmentStatus(sh as any)

    const prev = (sh as any).status

    if (!['ready', 'partial', 'shipped', 'delivered'].includes(status)) {
      throw new BadRequestException('Invalid shipment status')
    }
    ;(sh as any).status = status
    if (status === 'delivered') {
      ;(sh as any).deliveredAt = new Date()
    }
    if (confirmedByUserId) {
      ;(sh as any).confirmedByUserId = confirmedByUserId
    }
    await this.shipmentsRepository.save(sh as any)

    await this.audit(confirmedByUserId ?? null, 'shipment.status.set', 'shipment', {
      shipmentId,
      from: prev,
      to: status,
    })
    return { ok: true, shipment: sh }
  }

  async setOrderStatus(orderId: number, status: OrderStatus, warehouse = OpsService.DEFAULT_WAREHOUSE, actorUserId: number | null = null) {
    if (!ALLOWED_STATUSES.includes(status)) {
      throw new BadRequestException('Invalid status')
    }
    const order = await this.ordersRepository.findOne({ where: { id: orderId } })
    if (!order) throw new NotFoundException('Order not found')

    const prevStatus = order.status

    // переходы (мягко: разрешаем выставлять любой валидный статус, но делаем операции на ключевых)
    if (status === 'confirmed') {
      await this.ensureWarehouse(warehouse)
      await this.reserveForOrder(order, warehouse)
    }

    if (status === 'shipped') {
      await this.ensureWarehouse(warehouse)
      await this.shipOrder(order, warehouse)
      order.shippedAt = new Date()
      // зафиксируем отгрузку
      await this.ensureShipment(order.id)
      await this.shipmentsRepository.update(
        { orderId: order.id },
        { status: 'shipped', shippedAt: order.shippedAt },
      )
    }

    if (status === 'closed') {
      order.closedAt = new Date()
    }

    order.status = status
    await this.ordersRepository.save(order)

    await this.audit(actorUserId, 'order.status.set', 'order', {
      orderId,
      from: prevStatus,
      to: status,
      warehouse,
    })
    return { order }
  }

  private async ensureShipment(orderId: number) {
    const existing = await this.shipmentsRepository.findOne({ where: { orderId } })
    if (existing) return existing
    const created = this.shipmentsRepository.create({ orderId, status: 'created', shippedAt: null })
    return this.shipmentsRepository.save(created)
  }

  // ---------- Comments ----------

  async listComments(orderId: number) {
    const items = await this.commentsRepository.find({
      where: { orderId },
      order: { createdAt: 'ASC' },
    })
    return { comments: items }
  }

  async addComment(orderId: number, authorUserId: number, text: string) {
    const t = String(text ?? '').trim()
    if (!t) throw new BadRequestException('Empty comment')
    const order = await this.ordersRepository.findOne({ where: { id: orderId } })
    if (!order) throw new NotFoundException('Order not found')

    const c = this.commentsRepository.create({ orderId, authorUserId, text: t })
    await this.commentsRepository.save(c)
    return this.listComments(orderId)
  }

  // ---------- Warehouses & Stocks ----------

  async ensureWarehouse(code: string) {
    const c = String(code || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    let wh = await this.warehousesRepository.findOne({ where: { code: c } })
    if (!wh) {
      // Минимальный дефолт, чтобы UI не падал на пустой базе.
      // После урезания складов разрешены только 3 «жёстких» склада.
      const regionCode = ''
      const isMain =
        c === WAREHOUSE_CODES.BLANKS ||
        c === WAREHOUSE_CODES.FINISHED ||
        c === WAREHOUSE_CODES.DEFECT

      if (!isMain) {
        throw new BadRequestException(`Запрещённый код склада: ${c}`)
      }

      const type =
        c === WAREHOUSE_CODES.BLANKS
          ? WAREHOUSE_TYPES.BLANKS
          : c === WAREHOUSE_CODES.DEFECT
            ? WAREHOUSE_TYPES.DEFECT
            : WAREHOUSE_TYPES.FINISHED

      const name =
        c === WAREHOUSE_CODES.BLANKS
          ? 'Заготовки'
          : c === WAREHOUSE_CODES.DEFECT
            ? 'Брак'
            : 'Готовая продукция'

      wh = this.warehousesRepository.create({ code: c, name, regionCode, type })
      wh = await this.warehousesRepository.save(wh)
    }
    return wh
  }

  async listWarehouses(): Promise<{ warehouses: Warehouse[] }> {
    const warehouses = await this.warehousesRepository.find({ order: { id: 'ASC' } })
    if (warehouses.length === 0) {
      // чтобы UI всегда имел базовые склады из коробки
      await this.ensureWarehouse(WAREHOUSE_CODES.BLANKS)
      await this.ensureWarehouse(WAREHOUSE_CODES.FINISHED)
      await this.ensureWarehouse(WAREHOUSE_CODES.DEFECT)
      return this.listWarehouses()
    }
    return { warehouses }
  }

  async upsertWarehouse(code: string, name: string, regionCode?: string) {
    const c = String(code).trim().toUpperCase()
    if (!c) throw new BadRequestException('Warehouse code required')
    const n = String(name ?? '').trim()
    const r = String(regionCode ?? '').trim()
    let wh = await this.warehousesRepository.findOne({ where: { code: c } })
    if (!wh) {
      wh = this.warehousesRepository.create({ code: c, name: n || c, regionCode: r })
    } else {
      wh.name = n || wh.name || c
      if (typeof regionCode !== 'undefined') {
        wh.regionCode = r
      }
    }
    wh = await this.warehousesRepository.save(wh)
    return { warehouse: wh }
  }

  async deleteWarehouse(code: string) {
    const c = String(code).trim().toUpperCase()
    if (!c) throw new BadRequestException('Warehouse code required')

    // Protect default city so UI isn't left with zero cities
    // Удаление базового склада запрещено
    if (c === OpsService.DEFAULT_WAREHOUSE) return { ok: false, message: 'Нельзя удалить базовый склад' }

    const wh = await this.warehousesRepository.findOne({ where: { code: c } })
    if (!wh) return { ok: true }

    // Remove related stocks to avoid orphaned data in UI
    await this.stocksRepository.delete({ warehouse: c } as any)
    await this.warehousesRepository.remove(wh)
    return { ok: true }
  }

  // ----- Cities (reference table for catalog sorting) -----

  async listCities(): Promise<{ cities: City[] }> {
    const cities = await this.citiesRepository.find({ order: { name: 'ASC', code: 'ASC' } as any })
    if (cities.length === 0) {
      // ensure at least one city so UI isn't empty
      const c = this.citiesRepository.create({ code: 'VVO', name: 'Владивосток', regionCode: '25' })
      await this.citiesRepository.save(c)
      return this.listCities()
    }
    return { cities }
  }

  async upsertCity(code: string, name: string, regionCode?: string) {
    const c = String(code || '').trim().toUpperCase()
    if (!c) throw new BadRequestException('City code required')
    const n = String(name ?? '').trim()
    if (!n) throw new BadRequestException('City name required')
    const r = String(regionCode ?? '').trim()

    let row = await this.citiesRepository.findOne({ where: { code: c } as any })
    if (!row) {
      row = this.citiesRepository.create({ code: c, name: n, regionCode: r })
    } else {
      row.name = n
      row.regionCode = r
    }
    row = await this.citiesRepository.save(row)
    return { city: row }
  }

  async deleteCity(code: string) {
    const c = String(code || '').trim().toUpperCase()
    if (!c) throw new BadRequestException('City code required')
    const row = await this.citiesRepository.findOne({ where: { code: c } as any })
    if (!row) return { ok: true }
    await this.citiesRepository.remove(row)
    return { ok: true }
  }

  async listStocks(warehouse: string) {
    const wh = String(warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    await this.ensureWarehouse(wh)
    const stocks = await this.stocksRepository.find({
      where: { warehouse: wh } as any,
      order: { id: 'ASC' },
    })

    // Доп.метрики для UI готовой продукции: "свободно", "под заказы", "в отгрузке"
    const activeShipments = await this.shipmentsRepository.find({
      where: { status: In(['ready', 'partial']) } as any,
      order: { id: 'DESC' },
    })
    const orderIds = Array.from(new Set(activeShipments.map((s) => s.orderId))).filter(Boolean)
    const orders = orderIds.length
      ? await this.ordersRepository.find({ where: { id: In(orderIds) } as any })
      : []
    const orderMap = new Map<number, Order>()
    for (const o of orders) orderMap.set(o.id, o)

    const inShipmentByProduct = new Map<number, number>()
    for (const sh of activeShipments) {
      const order = orderMap.get(sh.orderId)
      if (!order) continue
      const shippedItems = sh.shippedItems || {}
      for (const it of (order.items || []) as any[]) {
        const pid = Number(it.productId)
        const need = Math.max(0, Number(it.quantity) || 0)
        if (!pid || !need) continue
        const shipped = Math.max(0, Number((shippedItems as any)[String(pid)] || 0))
        const pending = Math.max(0, need - shipped)
        if (!pending) continue
        inShipmentByProduct.set(pid, (inShipmentByProduct.get(pid) || 0) + pending)
      }
    }

    const enriched = stocks.map((s: any) => {
      const inShipmentQty = inShipmentByProduct.get(Number(s?.product?.id)) || 0
      const freeToSellQty = Number(s?.qty || 0) // свободно к продаже: qty уже без резервов
      const reservedForOrdersQty = Math.max(0, Number(s?.reservedQty || 0) - inShipmentQty)
      return {
        ...s,
        freeToSellQty,
        reservedForOrdersQty,
        inShipmentQty,
      }
    })

    return { warehouse: wh, stocks: enriched }
  }

  async listMovements(params: {
    warehouse?: string
    dateFrom?: string
    dateTo?: string
    productId?: string
    orderId?: string
    workOrderId?: string
    type?: string
    limit?: string
  }) {
    const wh = String(params?.warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    await this.ensureWarehouse(wh)
    const limit = Math.min(500, Math.max(10, Number(params?.limit || 200)))

    const qb = this.movementsRepository
      .createQueryBuilder('m')
      .where('m.warehouse = :wh', { wh })

    if (params?.dateFrom) {
      qb.andWhere('m.createdAt >= :from', { from: new Date(params.dateFrom) })
    }
    if (params?.dateTo) {
      qb.andWhere('m.createdAt <= :to', { to: new Date(params.dateTo) })
    }
    if (params?.productId && /^\d+$/.test(String(params.productId))) {
      qb.andWhere('m.productId = :pid', { pid: Number(params.productId) })
    }
    if (params?.orderId && /^\d+$/.test(String(params.orderId))) {
      qb.andWhere('m.orderId = :oid', { oid: Number(params.orderId) })
    }
    if (params?.workOrderId && /^\d+$/.test(String(params.workOrderId))) {
      qb.andWhere('m.workOrderId = :woid', { woid: Number(params.workOrderId) })
    }
    if (params?.type && ['in', 'out', 'reserve', 'unreserve', 'adjust'].includes(String(params.type))) {
      qb.andWhere('m.type = :t', { t: String(params.type) })
    }

    const movements = await qb.orderBy('m.createdAt', 'DESC').limit(limit).getMany()

    const productIds = Array.from(new Set(movements.map((m) => m.productId))).filter(Boolean)
    const userIds = Array.from(new Set(movements.map((m: any) => m.userId).filter(Boolean)))

    const [products, users] = await Promise.all([
      productIds.length ? this.productsRepository.find({ where: { id: In(productIds) } as any }) : Promise.resolve([]),
      userIds.length ? this.usersRepository.find({ where: { id: In(userIds) } as any }) : Promise.resolve([]),
    ])
    const pMap = new Map<number, Product>()
    for (const p of products) pMap.set(p.id, p)
    const uMap = new Map<number, User>()
    for (const u of users as any[]) uMap.set(u.id, u)

    const enriched = movements.map((m: any) => {
      const p = pMap.get(m.productId)
      const u = m.userId ? uMap.get(m.userId) : undefined
      const srcParts: string[] = []
      if (m.orderId) srcParts.push(`order#${m.orderId}`)
      if (m.workOrderId) srcParts.push(`WO#${m.workOrderId}`)
      const source = srcParts.length ? srcParts.join(' · ') : (m.note ? 'manual' : '—')
      return {
        ...m,
        product: p ? { id: p.id, name: p.name, article: p.article } : null,
        user: u ? { id: u.id, email: (u as any).email, name: (u as any).name || (u as any).fullName || null } : null,
        source,
      }
    })
    return { warehouse: wh, movements: enriched }
  }

  // ----- Inventory -----

  async listInventories(warehouse: string) {
    const wh = String(warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    const whEntity = await this.ensureWarehouse(wh)
    const sessions = await this.inventoryRepository.find({ where: { warehouseId: whEntity.id } as any, order: { id: 'DESC' } })
    return { warehouse: wh, sessions }
  }

  async createInventory(warehouse: string, createdByUserId?: number | null) {
    const wh = String(warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    const whEntity = await this.ensureWarehouse(wh)

    const stocks = await this.stocksRepository.find({ where: { warehouse: wh } as any })
    // InventorySession has only: warehouseId, status, createdAt
    const session = await this.inventoryRepository.save(this.inventoryRepository.create({ warehouseId: whEntity.id, status: 'draft' }))

    const items = stocks.map((s: any) =>
      this.inventoryItemsRepository.create({
        sessionId: session.id,
        productId: Number(s?.product?.id),
        expectedQty: Number(s?.qty || 0),
        actualQty: Number(s?.qty || 0),
      }),
    )
    if (items.length) {
      await this.inventoryItemsRepository.save(items)
    }
    return this.getInventory(session.id)
  }

  async getInventory(id: number) {
    const session = await this.inventoryRepository.findOne({ where: { id } as any })
    if (!session) throw new NotFoundException('Inventory not found')
    const items = await this.inventoryItemsRepository.find({ where: { sessionId: id } as any, order: { id: 'ASC' } })
    const productIds = Array.from(new Set(items.map((i) => i.productId))).filter(Boolean)
    const products = productIds.length ? await this.productsRepository.find({ where: { id: In(productIds) } as any }) : []
    const pMap = new Map<number, Product>()
    for (const p of products) pMap.set(p.id, p)
    const enriched = items.map((i) => ({
      ...i,
      product: pMap.get(i.productId) ? { id: i.productId, name: pMap.get(i.productId)!.name, article: pMap.get(i.productId)!.article } : null,
      diff: (Number(i.actualQty ?? 0) - Number(i.expectedQty || 0)),
    }))
    return { session, items: enriched }
  }

  async updateInventoryItem(sessionId: number, itemId: number, actualQty: number) {
    const session = await this.inventoryRepository.findOne({ where: { id: sessionId } as any })
    if (!session) throw new NotFoundException('Inventory not found')
    if (session.status !== 'draft') throw new BadRequestException('Inventory already applied')
    const item = await this.inventoryItemsRepository.findOne({ where: { id: itemId, sessionId } as any })
    if (!item) throw new NotFoundException('Item not found')
    item.actualQty = Math.max(0, Number(actualQty) || 0)
    await this.inventoryItemsRepository.save(item)
    return this.getInventory(sessionId)
  }

  async applyInventory(sessionId: number, userId?: number | null) {
    const session = await this.inventoryRepository.findOne({ where: { id: sessionId } as any })
    if (!session) throw new NotFoundException('Inventory not found')
    if (session.status !== 'draft') return this.getInventory(sessionId)

    const whEntity = await this.warehousesRepository.findOne({ where: { id: session.warehouseId } as any })
    if (!whEntity) throw new NotFoundException('Warehouse not found')
    const whCode = String((whEntity as any).code || OpsService.DEFAULT_WAREHOUSE).toUpperCase()

    const items = await this.inventoryItemsRepository.find({ where: { sessionId } as any })
    for (const it of items) {
      const qty = Math.max(0, Number(it.actualQty ?? it.expectedQty ?? 0))
      await this.adjustStock(whCode, it.productId, qty, `INVENTORY#${sessionId}`, userId || null)
    }
    session.status = 'applied'
    await this.inventoryRepository.save(session)
    return this.getInventory(sessionId)
  }

  async receiveStock(
    warehouse: string,
    productId: number,
    qty: number,
    note?: string,
    userId?: number | null,
    orderId?: number | null,
    workOrderId?: number | null,
  ) {
    return this.applyStockDelta(warehouse, productId, qty, 'in', note, userId || null, orderId ?? null, workOrderId ?? null)
  }
  async issueStock(
    warehouse: string,
    productId: number,
    qty: number,
    note?: string,
    userId?: number | null,
    orderId?: number | null,
    workOrderId?: number | null,
  ) {
    return this.applyStockDelta(warehouse, productId, -Math.abs(qty), 'out', note, userId || null, orderId ?? null, workOrderId ?? null)
  }
  async adjustStock(warehouse: string, productId: number, qty: number, note?: string, userId?: number | null) {
    // qty - абсолютное значение, записываем как adjust, и выставляем qty на значение
    const wh = String(warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    await this.ensureWarehouse(wh)
    const product = await this.productsRepository.findOne({ where: { id: productId } })
    if (!product) throw new NotFoundException('Product not found')

    let stock = await this.stocksRepository.findOne({
      where: { warehouse: wh, product: { id: productId } } as any,
    })
    if (!stock) {
      stock = this.stocksRepository.create({
        warehouse: wh,
        product,
        qty: 0,
        reservedQty: 0,
        onOrderQty: 0,
        minQty: 0,
      })
    }
    stock.qty = Math.max(0, Number(qty) || 0)
    await this.stocksRepository.save(stock)
    await this.movementsRepository.save(
      this.movementsRepository.create({
        warehouse: wh,
        productId,
        type: 'adjust',
        qty: Number(qty) || 0,
        orderId: null,
        userId: userId || null,
        note: note ?? null,
      }),
    )
    return { stock }
  }

  async transferStock(fromWarehouse: string, toWarehouse: string, productId: number, qty: number, note?: string, userId?: number | null) {
    const from = String(fromWarehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    const to = String(toWarehouse || '').trim().toUpperCase()
    if (!to) throw new BadRequestException('Target warehouse is required')
    const q = Math.abs(Number(qty) || 0)
    if (!q) throw new BadRequestException('Qty must be > 0')

    await this.ensureWarehouse(from)
    await this.ensureWarehouse(to)

    const noteOut = `TRANSFER → ${to}${note ? ' · ' + String(note) : ''}`
    const noteIn = `TRANSFER ← ${from}${note ? ' · ' + String(note) : ''}`

    const out = await this.issueStock(from, productId, q, noteOut, userId || null)
    const inc = await this.receiveStock(to, productId, q, noteIn, userId || null)
    return { fromStock: out.stock, toStock: inc.stock }
  }

  async setStockMinQty(warehouse: string, productId: number, minQty: number) {
    const wh = String(warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    await this.ensureWarehouse(wh)
    const product = await this.productsRepository.findOne({ where: { id: productId } })
    if (!product) throw new NotFoundException('Product not found')

    let stock = await this.stocksRepository.findOne({ where: { warehouse: wh, product: { id: productId } } as any })
    if (!stock) {
      stock = this.stocksRepository.create({ warehouse: wh, product, qty: 0, reservedQty: 0, onOrderQty: 0, minQty: 0 })
    }
    stock.minQty = Math.max(0, Number(minQty) || 0)
    await this.stocksRepository.save(stock)
    return { stock }
  }

  private async applyStockDelta(
    warehouse: string,
    productId: number,
    delta: number,
    movementType: StockMovementType,
    note?: string,
    userId?: number | null,
    orderId?: number | null,
    workOrderId?: number | null,
  ) {
    const wh = String(warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    await this.ensureWarehouse(wh)
    const product = await this.productsRepository.findOne({ where: { id: productId } })
    if (!product) throw new NotFoundException('Product not found')

    let stock = await this.stocksRepository.findOne({
      where: { warehouse: wh, product: { id: productId } } as any,
    })
    if (!stock) {
      stock = this.stocksRepository.create({
        warehouse: wh,
        product,
        qty: 0,
        reservedQty: 0,
        onOrderQty: 0,
        minQty: 0,
      })
    }
    stock.qty = Math.max(0, stock.qty + delta)
    await this.stocksRepository.save(stock)
    await this.movementsRepository.save(
      this.movementsRepository.create({
        warehouse: wh,
        productId,
        type: movementType,
        qty: Math.abs(delta),
        orderId: orderId ?? null,
        workOrderId: workOrderId ?? null,
        userId: userId || null,
        note: note ?? null,
      }),
    )
    return { stock }
  }

  // ---------- Production ----------

  async listProduction(params?: { status?: string; orderId?: string; q?: string }) {
    const where: any = {}
    const status = params?.status
    const orderId = params?.orderId
    if (status && ['planned', 'in_work', 'ready', 'canceled'].includes(status)) {
      where.status = status
    }
    if (orderId && /^\d+$/.test(String(orderId))) {
      where.orderId = Number(orderId)
    }
    const tasks = await this.productionRepository.find({ where, order: { createdAt: 'DESC' } })

    // enrich: product + обеспеченность заготовками (упрощённо: проверяем доступное qty по этому же продукту)
    const productIds = Array.from(new Set(tasks.map((t) => t.productId))).filter(Boolean)
    const products = productIds.length
      ? await this.productsRepository.findBy({ id: In(productIds) })
      : ([] as any[])
    const productsById = new Map<number, any>(products.map((p) => [p.id, p]))

    // берем остатки по складу заготовок, чтобы показать обеспеченность
    const wh = 'BLANKS'
    const stocks = productIds.length
      ? await this.stocksRepository.find({ where: { warehouse: wh, product: { id: In(productIds) } } as any })
      : ([] as any[])
    const stockByPid = new Map<number, any>()
    for (const s of stocks) {
      const pid = Number((s as any)?.product?.id)
      if (pid) stockByPid.set(pid, s)
    }

    const enriched = tasks.map((t: any) => {
      const p = productsById.get(t.productId) || null
      const s = stockByPid.get(t.productId) || null
      const available = s ? Math.max(0, Number(s.qty || 0) - Number(s.reservedQty || 0)) : 0
      const blanksOk = available >= Number(t.qty || 0)
      return {
        ...t,
        product: p ? { id: p.id, name: p.name, article: p.article, slug: p.slug } : null,
        blanks: [
          {
            productId: t.productId,
            article: p?.article || null,
            name: p?.name || null,
            needQty: Number(t.qty || 0),
            availableQty: available,
            reservedQty: s ? Number(s.reservedQty || 0) : 0,
          },
        ],
        blanksStatus: blanksOk ? 'OK' : 'Дефицит',
      }
    })

    // текстовый поиск (номер заказа/артикул/название)
    const q = String(params?.q || '').trim().toLowerCase()
    const filtered = q
      ? enriched.filter((t: any) => {
          const oid = String(t?.orderId || '')
          const a = String(t?.product?.article || '').toLowerCase()
          const n = String(t?.product?.name || '').toLowerCase()
          return oid.includes(q) || a.includes(q) || n.includes(q)
        })
      : enriched

    return { tasks: filtered }
  }

  async setProductionStatus(id: number, status: ProductionStatus) {
    if (!['planned', 'in_work', 'ready', 'canceled'].includes(status)) {
      throw new BadRequestException('Invalid status')
    }
    const task = await this.productionRepository.findOne({ where: { id } })
    if (!task) throw new NotFoundException('Task not found')
    task.status = status
    if (status === 'in_work' && !task.startedAt) task.startedAt = new Date()
    if (status === 'ready' && !task.finishedAt) task.finishedAt = new Date()
    if (status === 'canceled' && !task.canceledAt) task.canceledAt = new Date()
    await this.productionRepository.save(task)
    return { task }
  }

  async updateProductionMeta(id: number, body: { deadlineAt?: string | null; assignee?: string | null }) {
    const task = await this.productionRepository.findOne({ where: { id } })
    if (!task) throw new NotFoundException('Task not found')
    if (typeof body?.deadlineAt !== 'undefined') {
      const v = body.deadlineAt
      task.deadlineAt = v ? new Date(v) : null
    }
    if (typeof body?.assignee !== 'undefined') {
      const a = String(body.assignee || '').trim()
      task.assignee = a ? a : null
    }
    await this.productionRepository.save(task)
    return { task }
  }

  private async getOrCreateStock(warehouse: string, productId: number) {
    const wh = String(warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    await this.ensureWarehouse(wh)
    const product = await this.productsRepository.findOne({ where: { id: productId } })
    if (!product) throw new NotFoundException('Product not found')
    let stock = await this.stocksRepository.findOne({ where: { warehouse: wh, product: { id: productId } } as any })
    if (!stock) {
      stock = this.stocksRepository.create({ warehouse: wh, product, qty: 0, reservedQty: 0, onOrderQty: 0, minQty: 0 })
      stock = await this.stocksRepository.save(stock)
    }
    return stock
  }

  // Зарезервировать заготовки под задачу (упрощенно: резервируем тот же productId)
  // Reserve blanks for production task (defaults to BLANKS warehouse)
  async reserveProductionBlanks(id: number, warehouse = 'BLANKS', userId?: number) {
    const task = await this.productionRepository.findOne({ where: { id } })
    if (!task) throw new NotFoundException('Task not found')
    if (task.status === 'canceled') throw new BadRequestException('Task canceled')

    const wh = String(warehouse || 'BLANKS').trim().toUpperCase()
    const stock = await this.getOrCreateStock(wh, task.productId)
    const available = Math.max(0, Number(stock.qty || 0) - Number(stock.reservedQty || 0))
    const need = Number(task.qty || 0)
    const canReserve = Math.min(available, need)
    if (canReserve <= 0) {
      return { task, reserved: 0 }
    }
    stock.reservedQty = Number(stock.reservedQty || 0) + canReserve
    await this.stocksRepository.save(stock)
    await this.movementsRepository.save(
      this.movementsRepository.create({
        warehouse: wh,
        productId: task.productId,
        type: 'reserve',
        qty: canReserve,
        orderId: task.orderId,
        userId: userId || null,
        note: `PRODUCTION#${task.id}`,
      }),
    )
    return { task, reserved: canReserve }
  }

  // Старт задачи: по флагу может сразу списать заготовки (если не хватает — резервирует что может)
  async startProductionTask(
    id: number,
    params?: { warehouse?: string; consume?: boolean },
    userId?: number,
  ) {
    const task = await this.productionRepository.findOne({ where: { id } })
    if (!task) throw new NotFoundException('Task not found')
    if (task.status === 'canceled') throw new BadRequestException('Task canceled')
    const wh = String(params?.warehouse || 'BLANKS').trim().toUpperCase()
    const consume = !!params?.consume

    // сначала попробуем зарезервировать
    await this.reserveProductionBlanks(id, wh, userId)

    if (consume) {
      const stock = await this.getOrCreateStock(wh, task.productId)
      const need = Number(task.qty || 0)
      const reserved = Math.min(Number(stock.reservedQty || 0), need)
      const availableExtra = Math.max(0, Number(stock.qty || 0) - Number(stock.reservedQty || 0))
      const fromAvailable = Math.min(availableExtra, need - reserved)
      const totalOut = reserved + fromAvailable
      if (totalOut <= 0) throw new BadRequestException('Not enough blanks')

      // снимаем резерв и списываем
      if (reserved > 0) {
        stock.reservedQty = Math.max(0, Number(stock.reservedQty || 0) - reserved)
        await this.movementsRepository.save(
          this.movementsRepository.create({
            warehouse: wh,
            productId: task.productId,
            type: 'unreserve',
            qty: reserved,
            orderId: task.orderId,
            userId: userId || null,
            note: `PRODUCTION#${task.id}`,
          }),
        )
      }

      stock.qty = Math.max(0, Number(stock.qty || 0) - totalOut)
      await this.stocksRepository.save(stock)
      await this.movementsRepository.save(
        this.movementsRepository.create({
          warehouse: wh,
          productId: task.productId,
          type: 'out',
          qty: totalOut,
          orderId: task.orderId,
          userId: userId || null,
          note: `PRODUCTION#${task.id}`,
        }),
      )
    }

    task.status = 'in_work'
    if (!task.startedAt) task.startedAt = new Date()
    await this.productionRepository.save(task)
    return { task }
  }

  // Завершение задачи: приход готовой продукции (и перевод в ready)
  async finishProductionTask(
    id: number,
    params?: { warehouse?: string },
    userId?: number,
  ) {
    const task = await this.productionRepository.findOne({ where: { id } })
    if (!task) throw new NotFoundException('Task not found')
    if (task.status === 'canceled') throw new BadRequestException('Task canceled')

    task.status = 'ready'
    if (!task.finishedAt) task.finishedAt = new Date()
    await this.productionRepository.save(task)

    // сразу оприходуем готовое (аналог moveProductionToStock)
    await this.moveProductionToStock(id, params?.warehouse || OpsService.DEFAULT_WAREHOUSE, userId)
    return { task }
  }

  async moveProductionToStock(id: number, warehouse = 'FINISHED', userId?: number) {
    const task = await this.productionRepository.findOne({ where: { id } })
    if (!task) throw new NotFoundException('Task not found')
    if (task.status !== 'ready') {
      throw new BadRequestException('Task must be ready')
    }
    if (task.movedToStockAt) {
      return { task }
    }

    const wh = String(warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()
    await this.ensureWarehouse(wh)
    const product = await this.productsRepository.findOne({ where: { id: task.productId } })
    if (!product) throw new NotFoundException('Product not found')

    let stock = await this.stocksRepository.findOne({
      where: { warehouse: wh, product: { id: task.productId } } as any,
    })
    if (!stock) {
      stock = this.stocksRepository.create({ warehouse: wh, product, qty: 0, reservedQty: 0, onOrderQty: 0 })
    }
    stock.qty += task.qty
    stock.onOrderQty = Math.max(0, (stock.onOrderQty || 0) - task.qty)
    await this.stocksRepository.save(stock)
    await this.movementsRepository.save(
      this.movementsRepository.create({
        warehouse: wh,
        productId: task.productId,
        type: 'in',
        qty: task.qty,
        orderId: task.orderId,
        userId: userId || null,
        note: 'production -> stock',
      }),
    )

    task.movedToStockAt = new Date()
    await this.productionRepository.save(task)
    return { task, stock }
  }

  // ---------- Internal: reserve & ship ----------

  private async reserveForOrder(order: Order, warehouse: string) {
    const wh = String(warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()

    for (const item of order.items || []) {
      const productId = Number(item.productId)
      const need = Math.max(0, Number(item.quantity) || 0)
      if (!productId || !need) continue

      const product = await this.productsRepository.findOne({ where: { id: productId } })
      if (!product) continue

      let stock = await this.stocksRepository.findOne({
        where: { warehouse: wh, product: { id: productId } } as any,
      })
      if (!stock) {
        stock = this.stocksRepository.create({ warehouse: wh, product, qty: 0, reservedQty: 0, onOrderQty: 0 })
      }

      const canReserve = Math.min(stock.qty, need)
      if (canReserve > 0) {
        stock.qty -= canReserve
        stock.reservedQty = (stock.reservedQty || 0) + canReserve
        await this.stocksRepository.save(stock)
        await this.movementsRepository.save(
          this.movementsRepository.create({
            warehouse: wh,
            productId,
            type: 'reserve',
            qty: canReserve,
            orderId: order.id,
            note: null,
          }),
        )
      }

      const missing = need - canReserve
      if (missing > 0) {
        // под заказ/производство
        stock.onOrderQty = (stock.onOrderQty || 0) + missing
        await this.stocksRepository.save(stock)
        await this.ensureProductionTask(order.id, productId, missing)
      }
    }
  }

  private async ensureProductionTask(orderId: number, productId: number, qty: number) {
    // если уже есть задача для этого заказа+товара в planned/in_work/ready без movedToStockAt — не плодим
    const existing = await this.productionRepository.findOne({
      where: { orderId, productId, movedToStockAt: null } as any,
      order: { id: 'DESC' },
    })
    if (existing) {
      existing.qty += qty
      return this.productionRepository.save(existing)
    }
    const task = this.productionRepository.create({
      orderId,
      productId,
      qty,
      status: 'planned',
      movedToStockAt: null,
    })
    return this.productionRepository.save(task)
  }

  private async shipOrder(order: Order, warehouse: string) {
    const wh = String(warehouse || OpsService.DEFAULT_WAREHOUSE).trim().toUpperCase()

    for (const item of order.items || []) {
      const productId = Number(item.productId)
      const need = Math.max(0, Number(item.quantity) || 0)
      if (!productId || !need) continue

      let stock = await this.stocksRepository.findOne({
        where: { warehouse: wh, product: { id: productId } } as any,
      })
      if (!stock) {
        throw new BadRequestException('Not reserved')
      }

      if ((stock.reservedQty || 0) < need) {
        throw new BadRequestException('Not enough reserved stock to ship')
      }

      stock.reservedQty -= need
      await this.stocksRepository.save(stock)
      await this.movementsRepository.save(
        this.movementsRepository.create({
          warehouse: wh,
          productId,
          type: 'out',
          qty: need,
          orderId: order.id,
          note: null,
        }),
      )
    }
  }
}
