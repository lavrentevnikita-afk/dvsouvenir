import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { UsersService } from '../users/users.service'
import { StoreProfile } from './store-profile.entity'
import { StoreModerationLog } from './store-moderation-log.entity'
import { User } from '../users/user.entity'
import * as bcrypt from 'bcrypt'
import { Product } from '../catalog/product.entity'
import { Stock } from './stock.entity'
import { AuditLog } from '../admin-settings/audit-log.entity'
import { Order } from '../orders/order.entity'

@Injectable()
export class B2bService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(StoreProfile)
    private readonly storeRepo: Repository<StoreProfile>,
    @InjectRepository(StoreModerationLog)
    private readonly moderationRepo: Repository<StoreModerationLog>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  private async audit(userId: number | null, action: string, entity?: string | null, meta?: any) {
    try {
      await this.auditRepo.save(this.auditRepo.create({ userId: userId ?? null, action, entity: entity ?? null, meta: meta ?? null }))
    } catch {
      // audit не должен ломать основную операцию
    }
  }

  async registerStore(dto: {
    name: string
    email: string
    password: string
    companyName: string
    inn?: string
    kpp?: string
    ogrn?: string
    contacts?: Record<string, any>
    displayName?: string
    logoUrl?: string
    address?: string
    city?: string
    phone?: string
    website?: string
  }) {
    const email = dto.email.trim().toLowerCase()
    const existing = await this.usersService.findByEmail(email)
    
    let user: User

    if (existing) {
      // Если пользователь уже магазин или админ/менеджер — нельзя
      if (existing.role === 'store') {
        throw new BadRequestException('Магазин с таким email уже зарегистрирован')
      }
      if (existing.role === 'admin' || existing.role === 'manager' || existing.role === 'production') {
        throw new BadRequestException('Этот email используется сотрудником системы')
      }
      
      // Проверяем, нет ли уже профиля магазина у этого пользователя
      const existingProfile = await this.storeRepo.findOne({ where: { user: { id: existing.id } } })
      if (existingProfile) {
        throw new BadRequestException('Профиль магазина для этого аккаунта уже существует')
      }
      
      // Обновляем существующего покупателя до магазина
      const passwordHash = await bcrypt.hash(dto.password, 10)
      existing.role = 'store'
      existing.passwordHash = passwordHash
      if (dto.name) existing.name = dto.name
      user = await this.userRepo.save(existing)
      
      await this.audit(user.id, 'upgrade_to_store', 'user', { previousRole: 'customer' })
    } else {
      // Создаём нового пользователя
      const passwordHash = await bcrypt.hash(dto.password, 10)

      user = await this.userRepo.save(
        this.userRepo.create({
          name: dto.name,
          email,
          passwordHash,
          role: 'store',
        })
      )
    }

    const profile = await this.storeRepo.save(
      this.storeRepo.create({
        user,
        status: 'lead',
        companyName: dto.companyName,
        displayName: dto.displayName ?? dto.companyName ?? null,
        logoUrl: dto.logoUrl ?? null,
        address: dto.address ?? null,
        city: dto.city ?? null,
        phone: dto.phone ?? null,
        website: dto.website ?? null,
        inn: dto.inn ?? null,
        kpp: dto.kpp ?? null,
        ogrn: dto.ogrn ?? null,
        contacts: dto.contacts ?? null,
      })
    )

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
      storeProfile: { id: profile.id, status: profile.status, companyName: profile.companyName },
      upgraded: !!existing,
    }
  }

  async getMe(user: User) {
    if (user.role !== 'store') throw new ForbiddenException('Доступ только для магазинов')

    const profile = await this.storeRepo.findOne({ where: { user: { id: user.id } } })
    if (!profile) throw new NotFoundException('Профиль магазина не найден')

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
      storeProfile: {
        id: profile.id,
        status: profile.status,
        companyName: profile.companyName,
        displayName: profile.displayName,
        logoUrl: profile.logoUrl,
        address: profile.address,
        city: profile.city,
        phone: profile.phone,
        website: profile.website,
        inn: profile.inn,
        kpp: profile.kpp,
        ogrn: profile.ogrn,
        contacts: profile.contacts,
        priceGroupId: profile.priceGroupId,
        discountPercent: (profile as any).discountPercent ?? 0,
      },
    }
  }

  // dto допускает null для полей, которые можно «очистить» (например, logoUrl)
  async updateProfile(
    user: User,
    dto: Partial<{
      companyName: string
      displayName: string
      logoUrl: string | null
      address: string | null
      city: string | null
      phone: string | null
      website: string | null
      inn: string | null
      kpp: string | null
      ogrn: string | null
      contacts: Record<string, any> | null
      priceGroupId: number | null
    }>,
  ) {
    if (user.role !== 'store') throw new ForbiddenException('Доступ только для магазинов')

    const profile = await this.storeRepo.findOne({ where: { user: { id: user.id } } })
    if (!profile) throw new NotFoundException('Профиль магазина не найден')

    // обновляем только разрешённые поля
    if (typeof dto.companyName === 'string') profile.companyName = dto.companyName
    if (typeof dto.displayName === 'string') profile.displayName = dto.displayName
    if (typeof dto.logoUrl === 'string' || dto.logoUrl === null) profile.logoUrl = (dto.logoUrl as any) ?? null
    if (typeof dto.address === 'string' || dto.address === null) profile.address = (dto.address as any) ?? null
    if (typeof dto.city === 'string' || dto.city === null) profile.city = (dto.city as any) ?? null
    if (typeof dto.phone === 'string' || dto.phone === null) profile.phone = (dto.phone as any) ?? null
    if (typeof dto.website === 'string' || dto.website === null) profile.website = (dto.website as any) ?? null
    if (typeof dto.inn === 'string' || dto.inn === null) profile.inn = (dto.inn as any) ?? null
    if (typeof dto.kpp === 'string' || dto.kpp === null) profile.kpp = (dto.kpp as any) ?? null
    if (typeof dto.ogrn === 'string' || dto.ogrn === null) profile.ogrn = (dto.ogrn as any) ?? null
    if (dto.contacts !== undefined) profile.contacts = dto.contacts ?? null
    if (dto.priceGroupId !== undefined) profile.priceGroupId = (dto.priceGroupId as any) ?? null

    profile.updatedAt = new Date()
    await this.storeRepo.save(profile)

    await this.audit(user.id, 'store.profile.update', 'store', {
      storeUserId: user.id,
    })
    return this.getMe(user)
  }

  async activateStore(manager: User, userId: number) {
    if (manager.role !== 'manager' && manager.role !== 'admin') {
      throw new ForbiddenException('Доступ только для менеджера/админа')
    }

    const profile = await this.storeRepo.findOne({ where: { user: { id: userId } } })
    if (!profile) throw new NotFoundException('Профиль магазина не найден')

    profile.status = 'active'
    profile.rejectedReasonCode = null
    profile.rejectedReasonText = null
    profile.moderationNote = null
    profile.updatedAt = new Date()
    await this.storeRepo.save(profile)

    await this.audit(manager.id, 'store.status.set', 'store', {
      storeUserId: userId,
      to: 'active',
    })

    await this.moderationRepo.save(this.moderationRepo.create({
      storeProfileId: profile.id,
      action: 'approve',
      message: null,
      userId: manager.id,
    }))

    return { ok: true }
  }

  async rejectStore(manager: User, userId: number, dto: { reasonCode?: string; reasonText?: string }) {
    if (manager.role !== 'manager' && manager.role !== 'admin') {
      throw new ForbiddenException('Доступ только для менеджера/админа')
    }
    const profile = await this.storeRepo.findOne({ where: { user: { id: userId } } })
    if (!profile) throw new NotFoundException('Профиль магазина не найден')
    profile.status = 'blocked'
    profile.rejectedReasonCode = (dto.reasonCode ?? '').slice(0, 64) || null
    profile.rejectedReasonText = dto.reasonText ?? null
    profile.moderationNote = dto.reasonText ?? profile.moderationNote
    profile.updatedAt = new Date()
    await this.storeRepo.save(profile)

    await this.audit(manager.id, 'store.status.set', 'store', {
      storeUserId: userId,
      to: 'blocked',
      reasonCode: profile.rejectedReasonCode,
      reasonText: profile.rejectedReasonText,
    })

    await this.moderationRepo.save(this.moderationRepo.create({
      storeProfileId: profile.id,
      action: 'reject',
      message: dto.reasonText ? `reason: ${dto.reasonText}` : (dto.reasonCode ? `reasonCode: ${dto.reasonCode}` : null),
      userId: manager.id,
    }))

    return { ok: true }
  }

  async requestStoreInfo(manager: User, userId: number, dto: { message: string }) {
    if (manager.role !== 'manager' && manager.role !== 'admin') {
      throw new ForbiddenException('Доступ только для менеджера/админа')
    }
    const profile = await this.storeRepo.findOne({ where: { user: { id: userId } } })
    if (!profile) throw new NotFoundException('Профиль магазина не найден')

    profile.moderationNote = dto.message?.slice(0, 5000) || null
    profile.updatedAt = new Date()
    await this.storeRepo.save(profile)

    await this.audit(manager.id, 'store.request_info', 'store', {
      storeUserId: userId,
      message: dto.message?.slice(0, 300) || null,
    })

    await this.moderationRepo.save(this.moderationRepo.create({
      storeProfileId: profile.id,
      action: 'request_info',
      message: dto.message?.slice(0, 5000) || null,
      userId: manager.id,
    }))
    return { ok: true }
  }

  async setStoreDiscountPercent(manager: User, userId: number, discountPercent: number) {
    if (manager.role !== 'manager' && manager.role !== 'admin') {
      throw new ForbiddenException('Доступ только для менеджера/админа')
    }
    const profile = await this.storeRepo.findOne({ where: { user: { id: userId } } })
    if (!profile) throw new NotFoundException('Профиль магазина не найден')

    const v = Number(discountPercent)
    if (!Number.isFinite(v)) throw new BadRequestException('discountPercent must be a number')
    if (v < 0 || v > 100) throw new BadRequestException('discountPercent must be in 0..100')

    const prev = (profile as any).discountPercent ?? 0
    ;(profile as any).discountPercent = Math.round(v)
    profile.updatedAt = new Date()
    await this.storeRepo.save(profile)

    await this.audit(manager.id, 'store.discount.set', 'store', {
      storeUserId: userId,
      from: prev,
      to: (profile as any).discountPercent,
    })

    return { ok: true }
  }

  async storeModerationHistory(manager: User, userId: number) {
    if (manager.role !== 'manager' && manager.role !== 'admin') {
      throw new ForbiddenException('Доступ только для менеджера/админа')
    }
    const profile = await this.storeRepo.findOne({ where: { user: { id: userId } } })
    if (!profile) throw new NotFoundException('Профиль магазина не найден')
    const rows = await this.moderationRepo.find({
      where: { storeProfileId: profile.id },
      order: { createdAt: 'DESC' },
      take: 50,
    })
    return { history: rows }
  }

  async listStoresForManager(manager: User, status?: string) {
    if (manager.role !== 'manager' && manager.role !== 'admin') {
      throw new ForbiddenException('Доступ только для менеджера/админа')
    }

    const qb = this.storeRepo.createQueryBuilder('sp')
      .leftJoinAndSelect('sp.user', 'u')
      .orderBy('sp.created_at', 'DESC')

    if (status) qb.where('sp.status = :status', { status })

    const rows = await qb.getMany()
    return {
      stores: rows.map((p) => ({
        id: p.id,
        status: p.status,
        moderationNote: (p as any).moderationNote ?? null,
        notes: (p as any).notes ?? null,
        rejectedReasonCode: (p as any).rejectedReasonCode ?? null,
        rejectedReasonText: (p as any).rejectedReasonText ?? null,
        companyName: p.companyName,
        displayName: p.displayName,
        logoUrl: p.logoUrl,
        address: p.address,
        city: p.city,
        phone: p.phone,
        website: p.website,
        inn: p.inn,
        kpp: p.kpp,
        ogrn: p.ogrn,
        priceGroupId: p.priceGroupId,
        discountPercent: (p as any).discountPercent ?? 0,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        user: { id: p.user.id, name: p.user.name, email: p.user.email, role: p.user.role },
      })),
    }
  }

  // =========================
  // CRM Shops API (/api/admin/shops)
  // =========================
  async listShops(manager: User, params: { status?: string; city?: string; q?: string }) {
    if (manager.role !== 'manager' && manager.role !== 'admin') {
      throw new ForbiddenException('Доступ только для менеджера/админа')
    }

    const status = (params.status ?? '').trim()
    const city = (params.city ?? '').trim()
    const q = (params.q ?? '').trim()

    const qb = this.storeRepo.createQueryBuilder('sp')
      .leftJoinAndSelect('sp.user', 'u')
      .orderBy('sp.created_at', 'DESC')

    if (status) qb.andWhere('sp.status = :status', { status })
    if (city) qb.andWhere('sp.city ILIKE :city', { city: `%${city}%` })
    if (q) {
      qb.andWhere(
        '(sp.company_name ILIKE :q OR sp.display_name ILIKE :q OR sp.phone ILIKE :q OR u.email ILIKE :q OR u.name ILIKE :q)',
        { q: `%${q}%` },
      )
    }

    const rows = await qb.getMany()

    
// агрегаты по заказам: по shopId (store_profiles.id) - стабильная связь, не зависящая от email
const shopIds = rows.map((r) => r.id).filter(Boolean)
const aggByShopId = new Map<number, { ordersCount: number; lastOrderAt: Date | null; totalPaid: string | null }>()
if (shopIds.length) {
  const aggRows = await this.orderRepo
    .createQueryBuilder('o')
    .select('o.shopId', 'shopId')
    .addSelect('COUNT(*)', 'ordersCount')
    .addSelect('MAX(o.createdAt)', 'lastOrderAt')
    .addSelect('SUM(o.totalPrice)', 'totalPaid')
    .where('o.shopId IN (:...shopIds)', { shopIds })
    .groupBy('o.shopId')
    .getRawMany()

  for (const r of aggRows) {
    const sid = Number(r.shopId)
    if (!sid) continue
    aggByShopId.set(sid, {
      ordersCount: Number(r.ordersCount ?? 0),
      lastOrderAt: r.lastOrderAt ? new Date(r.lastOrderAt) : null,
      totalPaid: r.totalPaid ? String(r.totalPaid) : null,
    })
  }
}

return {
  shops: rows.map((p) => {
        const agg = aggByShopId.get(p.id)
        return {
          id: p.id,
          status: p.status,
          companyName: p.companyName,
          displayName: p.displayName,
          city: p.city,
          address: p.address,
          phone: p.phone,
          website: p.website,
          discountPercent: (p as any).discountPercent ?? 0,
          notes: (p as any).notes ?? null,
          moderationNote: (p as any).moderationNote ?? null,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          user: { id: p.user.id, name: p.user.name, email: p.user.email, role: p.user.role },
          ordersCount: agg?.ordersCount ?? 0,
          lastOrderAt: agg?.lastOrderAt ?? null,
          totalPaid: agg?.totalPaid ?? null,
        }
      }),
    }
  }

  async getShop(manager: User, shopId: number) {
    if (manager.role !== 'manager' && manager.role !== 'admin') {
      throw new ForbiddenException('Доступ только для менеджера/админа')
    }
    const p = await this.storeRepo.findOne({ where: { id: shopId }, relations: ['user'] })
    if (!p) throw new NotFoundException('Магазин не найден')

    const agg = await this.orderRepo
      .createQueryBuilder('o')
      .select('COUNT(*)', 'ordersCount')
      .addSelect('MAX(o.createdAt)', 'lastOrderAt')
      .addSelect('SUM(o.totalPrice)', 'totalPaid')
      .where('o.shopId = :shopId', { shopId: p.id })
      .getRawOne()

    return {
      shop: {
        id: p.id,
        status: p.status,
        companyName: p.companyName,
        displayName: p.displayName,
        city: p.city,
        address: p.address,
        phone: p.phone,
        website: p.website,
        discountPercent: (p as any).discountPercent ?? 0,
        notes: (p as any).notes ?? null,
        moderationNote: (p as any).moderationNote ?? null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        user: { id: p.user.id, name: p.user.name, email: p.user.email, role: p.user.role },
        ordersCount: Number(agg?.ordersCount ?? 0),
        lastOrderAt: agg?.lastOrderAt ? new Date(agg.lastOrderAt) : null,
        totalPaid: agg?.totalPaid ? String(agg.totalPaid) : null,
      },
    }
  }

  async updateShop(manager: User, shopId: number, patch: { status?: string; discountPercent?: number; notes?: string | null }) {
    if (manager.role !== 'manager' && manager.role !== 'admin') {
      throw new ForbiddenException('Доступ только для менеджера/админа')
    }

    const p = await this.storeRepo.findOne({ where: { id: shopId } })
    if (!p) throw new NotFoundException('Магазин не найден')

    const prev = { status: p.status, discountPercent: (p as any).discountPercent ?? 0, notes: (p as any).notes ?? null }

    if (patch.status !== undefined) {
      const s = String(patch.status)
      if (!['lead', 'active', 'blocked'].includes(s)) throw new BadRequestException('status must be one of: lead|active|blocked')
      p.status = s as any
      if (s !== 'blocked') {
        p.rejectedReasonCode = null
        p.rejectedReasonText = null
      }
    }

    if (patch.discountPercent !== undefined) {
      const v = Number(patch.discountPercent)
      if (!Number.isFinite(v)) throw new BadRequestException('discountPercent must be a number')
      if (v < 0 || v > 100) throw new BadRequestException('discountPercent must be in 0..100')
      ;(p as any).discountPercent = Math.round(v)
    }

    if (patch.notes !== undefined) {
      ;(p as any).notes = patch.notes === null ? null : String(patch.notes).slice(0, 5000)
    }

    p.updatedAt = new Date()
    await this.storeRepo.save(p)

    // audit: что поменяли
    if (patch.status !== undefined && prev.status !== p.status) {
      await this.audit(manager.id, 'store.status.set', 'store', { storeProfileId: p.id, from: prev.status, to: p.status })
    }
    if (patch.discountPercent !== undefined && prev.discountPercent !== (p as any).discountPercent) {
      await this.audit(manager.id, 'store.discount.set', 'store', { storeProfileId: p.id, from: prev.discountPercent, to: (p as any).discountPercent })
    }
    if (patch.notes !== undefined && prev.notes !== (p as any).notes) {
      await this.audit(manager.id, 'store.notes.set', 'store', { storeProfileId: p.id })
    }

    return { ok: true }
  }

  async getShopOrders(
    manager: User,
    shopId: number,
    params: { status?: string; dateFrom?: string; dateTo?: string },
  ) {
    if (manager.role !== 'manager' && manager.role !== 'admin') {
      throw new ForbiddenException('Доступ только для менеджера/админа')
    }

    const shop = await this.storeRepo.findOne({ where: { id: shopId } })
    if (!shop) throw new NotFoundException('Магазин не найден')

    const status = (params.status ?? '').trim()
    const dateFrom = (params.dateFrom ?? '').trim()
    const dateTo = (params.dateTo ?? '').trim()

    const qb = this.orderRepo.createQueryBuilder('o')
      .where('o.shopId = :shopId', { shopId })
      .orderBy('o.createdAt', 'DESC')

    if (status) qb.andWhere('o.status = :status', { status })
    if (dateFrom) qb.andWhere('o.createdAt >= :df', { df: new Date(dateFrom) })
    if (dateTo) qb.andWhere('o.createdAt < :dt', { dt: new Date(dateTo) })

    const orders = await qb.take(200).getMany()

    return {
      orders: orders.map((o: any) => ({
        id: o.id,
        createdAt: o.createdAt,
        status: o.status,
        totalPrice: o.totalPrice,
        itemsCount: Array.isArray(o.items) ? o.items.length : 0,
        comment: o.comment ?? null,
      })),
    }
  }

  async getShopAudit(manager: User, shopId: number) {
    if (manager.role !== 'manager' && manager.role !== 'admin') {
      throw new ForbiddenException('Доступ только для менеджера/админа')
    }

    const shop = await this.storeRepo.findOne({ where: { id: shopId } })
    if (!shop) throw new NotFoundException('Магазин не найден')

    const rows = await this.auditRepo
      .createQueryBuilder('a')
      .where('a.entity = :entity', { entity: 'store' })
      .andWhere(`(a.meta->>'storeProfileId')::int = :shopId`, { shopId })
      .orderBy('a.createdAt', 'DESC')
      .take(100)
      .getMany()

    return {
      history: rows.map((r) => ({
        id: r.id,
        action: r.action,
        createdAt: r.createdAt,
        meta: r.meta ?? null,
        userId: r.userId,
      })),
    }
  }

  /**
   * Остатки по артикулам (для быстрого заказа).
   * GET /api/b2b/stock?articles=SV-0001,SV-0002
   */
  async getStock(user: User, articles?: string) {
    if (user.role !== 'store' && user.role !== 'manager' && user.role !== 'admin') {
      throw new ForbiddenException('Недостаточно прав')
    }

    const list = (articles ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (!list.length) return { items: [] }

    const products = await this.productRepo.find({ where: { article: In(list) } })
    const byArticle = new Map(products.map((p) => [p.article, p]))

    const rows = products.length
      ? await this.stockRepo.find({
          where: { product: { id: In(products.map((p) => p.id)) } },
        })
      : []

    const out = list.map((article) => {
      const p = byArticle.get(article)
      const stocks = p ? rows.filter((r) => r.product.id === p.id) : []
      const total = stocks.reduce((sum, r) => sum + (r.qty ?? 0), 0)
      return {
        article,
        productId: p?.id ?? null,
        name: (p as any)?.name ?? null,
        total,
        byWarehouse: stocks.map((s) => ({ warehouse: s.warehouse, qty: s.qty })),
      }
    })

    return { items: out }
  }
}
