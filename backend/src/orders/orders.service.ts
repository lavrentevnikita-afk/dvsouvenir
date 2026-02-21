import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
  OnModuleInit,
  HttpStatus,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, In, Repository } from 'typeorm'
import { Order, OrderItemRecord } from './order.entity'
import { StoreProfile } from '../b2b/store-profile.entity'
import { User } from '../users/user.entity'
import { CreateOrderDto, GetOrdersFilterDto } from './dto'
import { Product } from '../catalog/product.entity'
import { PricingService } from '../shared/pricing/pricing.service'
import { Stock } from '../b2b/stock.entity'
import * as iconv from 'iconv-lite'
import { AppErrorCode, throwAppError } from '../shared/errors/app-error'

type ReceiptStatusStep = { key: string; label: string; done: boolean }

export type ReceiptData = {
  orderId: number
  createdAt: Date
  status: string
  customerName: string
  email: string
  phone: string | null
  address: string
  comment: string | null
  isB2B: boolean
  discountPercent: number
  items: Array<{
    productId: number
    name: string
    quantity: number
    assets: string[]
    retailUnit: number
    discountUnit: number
    finalUnit: number
    retailLine: number
    discountLine: number
    finalLine: number
  }>
  totals: { retail: number; discount: number; final: number }
  statusSteps: ReceiptStatusStep[]
  nextStep: { title: string; text: string }
}

@Injectable()
export class OrdersService implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name)

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Stock)
    private readonly stocksRepository: Repository<Stock>,
    @InjectRepository(StoreProfile)
    private readonly storeProfilesRepository: Repository<StoreProfile>,
    private readonly pricing: PricingService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    // Backfill shopId for legacy B2B orders that were linked by email.
    // Idempotent: only fills NULL shopId.
    try {
      await this.dataSource.query(`
        UPDATE orders o
        SET "shopId" = sp.id
        FROM users u
        JOIN store_profiles sp ON sp.user_id = u.id
        WHERE o."shopId" IS NULL
          AND o.email IS NOT NULL
          AND LOWER(o.email) = LOWER(u.email)
      `)
    } catch (e: any) {
      this.logger.warn(`shopId backfill skipped: ${String(e?.message || e)}`)
    }
  }

  private async createInternal(dto: CreateOrderDto, user?: User): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throwAppError(
        AppErrorCode.VALIDATION_ERROR,
        'Заказ должен содержать хотя бы одну позицию',
        { field: 'items' },
        HttpStatus.BAD_REQUEST,
      )
    }

    const normalizedEmail = (dto.email ?? '').trim().toLowerCase()
    if (!normalizedEmail) {
      throwAppError(
        AppErrorCode.VALIDATION_ERROR,
        'Email обязателен для создания заказа',
        { field: 'email' },
        HttpStatus.BAD_REQUEST,
      )
    }

    // Normalize + validate quantities early
    const qtyByProductId = new Map<number, number>()
    for (const it of dto.items) {
      const pid = Number((it as any).productId)
      const q = Number((it as any).quantity)
      if (!Number.isFinite(pid) || pid <= 0) {
        throwAppError(AppErrorCode.VALIDATION_ERROR, 'Некорректный productId', { productId: it.productId })
      }
      if (!Number.isFinite(q) || q <= 0) {
        throwAppError(AppErrorCode.VALIDATION_ERROR, 'Количество должно быть >= 1', { productId: pid, quantity: it.quantity })
      }
      qtyByProductId.set(pid, Math.round(q))
    }

    const productIds = Array.from(qtyByProductId.keys())

    const products = await this.productsRepository.find({
      where: { id: In(productIds) },
    })

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id))
      const missing = productIds.filter((id) => !foundIds.has(id))
      throw new NotFoundException(
        `Products not found: ${missing.join(', ')}`,
      )
    }


    // Pricing + shop context (B2B discount + stable shopId link)
    let discountPercent = 0
    let shopId: number | null = null
    if (user && (user as any).role === 'store') {
      const profile = await this.storeProfilesRepository.findOne({
        where: { user: { id: (user as any).id } },
      })
      shopId = (profile as any)?.id ?? null
      // discountPercent = 0; // ОПТ-скидка отключена
    }

    // Server-side availability validation (source of truth)
    // FINISHED + BLANKS must be enough to cover quantity, and product must be available.
    const stocks = await this.stocksRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.product', 'product')
      .where('product.id IN (:...ids)', { ids: productIds })
      .andWhere('s.warehouse IN (:...wh)', { wh: ['FINISHED', 'BLANKS'] })
      .getMany()

    const stockMap = new Map<string, { qty: number; reserved: number }>()
    for (const s of stocks as any[]) {
      const pid = Number((s.product?.id ?? s.productId))
      const wh = String((s as any).warehouse)
      stockMap.set(`${pid}:${wh}`, { qty: Number((s as any).qty || 0), reserved: Number((s as any).reservedQty || 0) })
    }

    const unavailable: Array<{ productId: number; requested: number; available: number; reason: string }> = []
    for (const p of products) {
      const pid = Number(p.id)
      const requested = qtyByProductId.get(pid) ?? 1
      const fin = stockMap.get(`${pid}:FINISHED`)
      const bla = stockMap.get(`${pid}:BLANKS`)
      const finishedFree = Math.max(0, (fin?.qty ?? 0) - (fin?.reserved ?? 0))
      const blanksFree = Math.max(0, (bla?.qty ?? 0) - (bla?.reserved ?? 0))
      const available = finishedFree + blanksFree
      const isAvailable = Boolean((p as any).isAvailable !== false) && !(p as any).archived

      if (!isAvailable) {
        unavailable.push({ productId: pid, requested, available: 0, reason: 'PRODUCT_DISABLED' })
      } else if (available < requested) {
        unavailable.push({ productId: pid, requested, available, reason: 'OUT_OF_STOCK' })
      }
    }

    if (unavailable.length) {
      throwAppError(
        AppErrorCode.CART_ITEM_UNAVAILABLE,
        'Некоторые товары сейчас недоступны в выбранном количестве',
        { items: unavailable },
        HttpStatus.CONFLICT,
      )
    }

    const getFinalUnitPrice = (product: Product) => {
      const pb = this.pricing.getPriceForContext(product as any, { discountPercent: 0 })
      return pb.final
    }

    const items: OrderItemRecord[] = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        // На всякий случай, хотя выше уже есть проверка
        throw new NotFoundException(
          `Product with id ${item.productId} not found`,
        )
      }

      return {
        productId: product.id,
        quantity: item.quantity,
        price: String(getFinalUnitPrice(product)), // единый расчёт цены на сервере
        name: product.name,
      }
    })

    const totalPriceNumber = items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity
    }, 0)

    const order = this.ordersRepository.create({
      customerName: dto.customerName,   // <-- ИСПОЛЬЗУЕМ customerName ИЗ DTO
      email: normalizedEmail,
      phone: dto.phone ?? null,
      address: "Самовывоз со склада",
      comment: dto.comment ?? null,
      totalPrice: totalPriceNumber.toFixed(2),
      discountPercent: Math.round(discountPercent) || 0,
      shopId,
      status: 'new',
      items,
    })
const savedOrder = await this.ordersRepository.save(order)

    // Отправляем email уведомление (асинхронно)
// ...existing code...

    return savedOrder
    return this.ordersRepository.save(order)
  }


  // Backward-compatible: if called without user context — retail pricing
  async create(dto: CreateOrderDto): Promise<Order> {
    return this.createInternal(dto)
  }

  // Auth-aware: store gets wholesale pricing based on discountPercent
  async createWithUser(dto: CreateOrderDto, user?: User): Promise<Order> {
    return this.createInternal(dto, user)
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      order: { createdAt: 'DESC' },
    })
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } })

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`)
    }

    return order
  }

  async getForEmail(email: string): Promise<Order[]> {
    const normalizedEmail = email.trim().toLowerCase()
    return this.ordersRepository.find({
      where: { email: normalizedEmail },
      order: { createdAt: 'DESC' },
    })
  }

  async getForShopId(shopId: number): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { shopId },
      order: { createdAt: 'DESC' },
    })
  }

  async getMyOrdersForUser(user: any): Promise<Order[]> {
    const role = user?.role
    if (role === 'store') {
      const profile = await this.storeProfilesRepository.findOne({
        where: { user: { id: user?.id } },
      })
      const shopId = (profile as any)?.id
      const email: string | undefined = user?.email
      const normalizedEmail = email?.trim?.().toLowerCase?.()
      // Migration-friendly: показываем как новые (shopId), так и старые (по email) заказы магазина
      if (shopId) {
        const where: any[] = [{ shopId: Number(shopId) }]
        if (normalizedEmail) where.push({ shopId: null, email: normalizedEmail })
        return this.ordersRepository.find({
          where: where as any,
          order: { createdAt: 'DESC' },
        })
      }

      if (!normalizedEmail) return []
      return this.ordersRepository.find({
        where: { email: normalizedEmail },
        order: { createdAt: 'DESC' },
      })
    }

    const email: string | undefined = user?.email
    if (!email) return []
    return this.getForEmail(email)
  }

  async assertUserCanAccessOrder(order: Order, user: any): Promise<void> {
    const role = user?.role
    if (role === 'admin' || role === 'manager' || role === 'production') return

    if (role === 'store') {
      const profile = await this.storeProfilesRepository.findOne({
        where: { user: { id: user?.id } },
      })
      const shopId = (profile as any)?.id
      const orderShopId = (order as any).shopId
      // Migration-friendly fallback: старые заказы могли быть без shopId, тогда пускаем по email
      if (orderShopId == null) {
        const email: string | undefined = user?.email?.trim?.().toLowerCase?.()
        if (!email || email !== order.email) throw new NotFoundException('Order not found')
      } else {
        if (!shopId || Number(orderShopId) !== Number(shopId)) {
          throw new NotFoundException('Order not found')
        }
      }
      return
    }

    const email: string | undefined = user?.email?.trim?.().toLowerCase?.()
    if (!email || email !== order.email) {
      throw new NotFoundException('Order not found')
    }
  }

  async getOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } })

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`)
    }

    return order
  }

  /**
   * Получить заказы пользователя с фильтрацией и пагинацией
   */
  async getMyOrdersWithFilters(
    user: any,
    filters: GetOrdersFilterDto,
  ): Promise<{ orders: Order[]; total: number; page: number; limit: number; totalPages: number }> {
    const { status, dateFrom, dateTo, search, page = 1, limit = 10 } = filters

    const qb = this.ordersRepository.createQueryBuilder('order')

    // Фильтр по пользователю (как в getMyOrdersForUser)
    const role = user?.role
    if (role === 'store') {
      const profile = await this.storeProfilesRepository.findOne({
        where: { user: { id: user?.id } },
      })
      const shopId = (profile as any)?.id
      const email: string | undefined = user?.email?.trim?.().toLowerCase?.()
      
      if (shopId) {
        qb.where('(order.shopId = :shopId OR (order.shopId IS NULL AND LOWER(order.email) = :email))', {
          shopId: Number(shopId),
          email,
        })
      } else if (email) {
        qb.where('LOWER(order.email) = :email', { email })
      } else {
        return { orders: [], total: 0, page, limit, totalPages: 0 }
      }
    } else {
      const email: string | undefined = user?.email?.trim?.().toLowerCase?.()
      if (!email) return { orders: [], total: 0, page, limit, totalPages: 0 }
      qb.where('LOWER(order.email) = :email', { email })
    }

    // Фильтры
    if (status) {
      qb.andWhere('order.status = :status', { status })
    }
    if (dateFrom) {
      qb.andWhere('order.createdAt >= :dateFrom', { dateFrom: new Date(dateFrom) })
    }
    if (dateTo) {
      qb.andWhere('order.createdAt <= :dateTo', { dateTo: new Date(dateTo) })
    }
    if (search) {
      qb.andWhere('(CAST(order.id AS TEXT) LIKE :search OR order.customerName ILIKE :search)', {
        search: `%${search}%`,
      })
    }

    // Подсчет total
    const total = await qb.getCount()

    // Пагинация
    const offset = (page - 1) * limit
    qb.orderBy('order.createdAt', 'DESC')
      .skip(offset)
      .take(limit)

    const orders = await qb.getMany()

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Получить один заказ по ID с проверкой доступа
   */
  async getOneByUser(id: number, user: any): Promise<Order> {
    const order = await this.getOne(id)
    await this.assertUserCanAccessOrder(order, user)
    return order
  }


  /**
   * Единый генератор данных чека/счёта (розница + B2B)
   * ВАЖНО: цены в заказе уже сохранены (finalUnit), но для прозрачности
   * мы считаем retail/discount по текущей цене товара и сохранённой скидке заказа.
   */
  async getReceiptData(id: number, user?: User): Promise<ReceiptData> {
    const order = await this.getOne(id)

    await this.assertUserCanAccessOrder(order, user as any)

    const productIds = (order.items ?? []).map((i) => i.productId)
    const products = productIds.length
      ? await this.productsRepository.find({ where: { id: In(productIds) } })
      : []
    const byId = new Map(products.map((p) => [p.id, p]))

    const discountPercent = Math.max(0, Math.min(100, Number((order as any).discountPercent ?? 0)))
    const isB2B = discountPercent > 0

    const items = (order.items ?? []).map((it) => {
      const p = byId.get(it.productId)
      const pb = this.pricing.getPriceForContext(p ? (p as any) : ({ price: 0 } as any), {
        discountPercent,
      })
      const retailUnit = pb.retail
      const finalUnit = Number(it.price ?? 0)
      const expectedFinal = pb.final
      // если цена товара изменилась после заказа — показываем сохранённую finalUnit, но
      // discount считаем относительно retail на сегодня (так честнее, чем придумывать)
      const finalToShow = Number.isFinite(finalUnit) && finalUnit > 0 ? Math.round(finalUnit) : expectedFinal
      const discountUnit = Math.max(0, retailUnit - finalToShow)
      const qty = Number(it.quantity ?? 0)
      const retailLine = retailUnit * qty
      const finalLine = finalToShow * qty
      const discountLine = discountUnit * qty
      const assets: string[] = Array.isArray((p as any)?.images)
        ? (p as any).images.map((x: any) => x?.url).filter((u: any) => typeof u === 'string')
        : []

      return {
        productId: it.productId,
        name: it.name || (p as any)?.name || `Товар #${it.productId}`,
        quantity: qty,
        assets,
        retailUnit,
        discountUnit,
        finalUnit: finalToShow,
        retailLine,
        discountLine,
        finalLine,
      }
    })

    const totals = items.reduce(
      (acc, i) => {
        acc.retail += i.retailLine
        acc.discount += i.discountLine
        acc.final += i.finalLine
        return acc
      },
      { retail: 0, discount: 0, final: 0 },
    )

    const stepsOrder: Array<{ key: string; label: string }> = [
      { key: 'new', label: 'Принят' },
      { key: 'in_work', label: 'В работе' },
      { key: 'ready_to_ship', label: 'Готов к отгрузке' },
      { key: 'shipped', label: 'Отправлен' },
      { key: 'completed', label: 'Завершён' },
    ]
    const canceledKeys = new Set(['canceled', 'cancelled', 'rejected'])
    const status = String(order.status || 'new')
    const statusSteps: ReceiptStatusStep[] = canceledKeys.has(status)
      ? [
          { key: 'new', label: 'Принят', done: true },
          { key: status, label: 'Отменён', done: true },
        ]
      : stepsOrder.map((s, idx) => {
          const currentIdx = stepsOrder.findIndex((x) => x.key === status)
          return {
            ...s,
            done: currentIdx === -1 ? idx === 0 : idx <= currentIdx,
          }
        })

    const nextStep = (() => {
      switch (status) {
        case 'new':
          return { title: 'Что дальше', text: 'Мы подтвердим заказ и передадим его в производство.' }
        case 'in_work':
          return { title: 'Что дальше', text: 'Заказ собирается/изготавливается. Мы сообщим, когда он будет готов.' }
        case 'ready_to_ship':
          return { title: 'Что дальше', text: 'Заказ готов. Скоро отправим/передадим в отгрузку.' }
        case 'shipped':
          return { title: 'Что дальше', text: 'Заказ отправлен. Ожидайте доставку/получение.' }
        case 'completed':
          return { title: 'Спасибо!', text: 'Заказ завершён. Если что-то не так — напишите нам, мы поможем.' }
        default:
          if (canceledKeys.has(status)) return { title: 'Заказ отменён', text: 'Если это ошибка — свяжитесь с нами.' }
          return { title: 'Что дальше', text: 'Мы обработаем заказ и сообщим о следующем шаге.' }
      }
    })()

    return {
      orderId: order.id,
      createdAt: order.createdAt,
      status,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      comment: order.comment,
      isB2B,
      discountPercent,
      items,
      totals,
      statusSteps,
      nextStep,
    }
  }

  /**
   * Получить все заказы для менеджера с фильтрами
   */
  async getAllForManager(filters: GetOrdersFilterDto & { customerName?: string; customerEmail?: string; customerPhone?: string; search?: string }) {
    const { status, dateFrom, dateTo, search, customerName, customerEmail, customerPhone, page = 1, limit = 20 } = filters

    const qb = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.user', 'user')
      .orderBy('order.createdAt', 'DESC')

    if (status) {
      qb.andWhere('order.status = :status', { status })
    }

    if (dateFrom) {
      qb.andWhere('order.createdAt >= :dateFrom', { dateFrom })
    }

    if (dateTo) {
      qb.andWhere('order.createdAt <= :dateTo', { dateTo })
    }

    if (customerName) {
      qb.andWhere('LOWER(order.customerName) LIKE LOWER(:customerName)', { customerName: `%${customerName}%` })
    }

    if (customerEmail) {
      qb.andWhere('LOWER(order.email) LIKE LOWER(:customerEmail)', { customerEmail: `%${customerEmail}%` })
    }

    if (customerPhone) {
      qb.andWhere('order.phone LIKE :customerPhone', { customerPhone: `%${customerPhone}%` })
    }

    if (search) {
      qb.andWhere(
        '(LOWER(order.customerName) LIKE LOWER(:search) OR LOWER(order.email) LIKE LOWER(:search) OR CAST(order.id AS TEXT) LIKE :search)',
        { search: `%${search}%` }
      )
    }

    const [orders, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Получить один заказ для менеджера (без ограничения по userId)
   */
  async getOneForManager(orderId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });

    if (!order) {
      throw new NotFoundException(`Заказ #${orderId} не найден`)
    }

    return order
  }

  /**
   * Обновить статус заказа (только для менеджеров)
   */
  async updateStatus(orderId: number, status: string, note?: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    })

    if (!order) {
      throw new NotFoundException(`Заказ #${orderId} не найден`)
    }

    const oldStatus = order.status

    // Обновляем статус
    order.status = status as any

    await this.ordersRepository.save(order)

    // Отправляем email о смене статуса
    try {
    // ...existing code...
    } catch (error) {
      this.logger.warn(`Failed to send status change email for order ${orderId}: ${error}`)
    }

    return order
  }

  /**
   * Назначить менеджера на заказ
   */
  async assignManager(orderId: number, managerId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    })

    if (!order) {
      throw new NotFoundException(`Заказ #${orderId} не найден`)
    }

    // Здесь можно добавить проверку существования менеджера
    // const manager = await this.usersRepository.findOne({ where: { id: managerId, role: 'manager' } })

    await this.ordersRepository.save(order)

    return order
  }

  /**
   * Экспорт заказов в CSV (id, дата, клиент, email, телефон, сумма, статус, товары)
   */
  async exportOrdersCsv(): Promise<Buffer> {
    const orders = await this.ordersRepository.find({ order: { createdAt: 'DESC' } })
    const header = [
      'ID', 'Дата', 'Клиент', 'Email', 'Телефон', 'Сумма', 'Статус', 'Товары'
    ]
    const rows = [header]
    for (const o of orders) {
      const items = Array.isArray(o.items)
        ? o.items.map(i => `${i.name} (x${i.quantity})`).join('; ')
        : ''
      rows.push([
        String(o.id),
        o.createdAt ? new Date(o.createdAt).toLocaleString('ru-RU') : '',
        o.customerName || '',
        o.email || '',
        o.phone || '',
        o.totalPrice || '',
        o.status || '',
        items
      ])
    }
    // CSV строка с экранированием
    const csv = rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\r\n')
    // Кодируем в Windows-1251 для Excel/1C
    return iconv.encode(csv, 'win1251')
  }
}
