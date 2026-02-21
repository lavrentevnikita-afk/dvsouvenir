import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Product } from '../catalog/product.entity'
import { Stock } from '../b2b/stock.entity'
import { StockMovement } from '../ops/stock-movement.entity'
import { Warehouse } from '../ops/warehouse.entity'
import { InventoryLine } from '../ops/inventory-line.entity'
import { InventorySession, InventorySessionStatus } from '../ops/inventory-session.entity'
import { User } from '../users/user.entity'
import { STOCK_MOVEMENT_TYPES } from '../shared/enums'

type WarehouseCode = 'BLANKS' | 'FINISHED' | 'DEFECT'

@Injectable()
export class AdminInventoryService {
  constructor(
    @InjectRepository(Warehouse) private readonly whRepo: Repository<Warehouse>,
    @InjectRepository(Stock) private readonly stockRepo: Repository<Stock>,
    @InjectRepository(StockMovement) private readonly movementRepo: Repository<StockMovement>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(InventorySession) private readonly sessRepo: Repository<InventorySession>,
    @InjectRepository(InventoryLine) private readonly lineRepo: Repository<InventoryLine>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  private normalizeWh(code?: any): WarehouseCode {
    const c = String(code || '').trim().toUpperCase()
    if (c === 'BLANKS' || c === 'FINISHED' || c === 'DEFECT') return c
    throw new BadRequestException('warehouse must be BLANKS|FINISHED|DEFECT')
  }

  private async resolveWarehouseId(input: { warehouseId?: any; warehouse?: any }): Promise<number> {
    if (input.warehouseId != null && String(input.warehouseId).trim() !== '') {
      const id = Number(input.warehouseId)
      if (!Number.isFinite(id) || id <= 0) throw new BadRequestException('warehouseId must be a positive number')
      const wh = await this.whRepo.findOne({ where: { id } as any })
      if (!wh) throw new NotFoundException('Warehouse not found')
      return wh.id
    }
    const code = this.normalizeWh(input.warehouse)
    const wh = await this.whRepo.findOne({ where: { code } as any })
    if (!wh) throw new NotFoundException(`Warehouse ${code} not found`)
    return wh.id
  }

  async listSessions(opts: { status?: InventorySessionStatus; warehouse?: WarehouseCode }) {
    let qb = this.sessRepo
      .createQueryBuilder('s')
      .leftJoin(Warehouse, 'w', 'w.id = s.warehouseId')
      .addSelect(['w.id AS w_id', 'w.code AS w_code', 'w.name AS w_name', 'w.type AS w_type'])
      .orderBy('s.id', 'DESC')
      .limit(50)
    if (opts.status) qb = qb.andWhere('s.status = :st', { st: opts.status })
    if (opts.warehouse) qb = qb.andWhere('w.code = :code', { code: opts.warehouse })

    const rows = await qb.getRawMany()
    const sessions = rows.map((r: any) => ({
      id: Number(r.s_id),
      status: r.s_status,
      createdAt: r.s_createdAt,
      warehouse: { id: Number(r.w_id), code: r.w_code, name: r.w_name, type: r.w_type },
    }))
    return { sessions }
  }

  async createSession(input: { warehouseId?: any; warehouse?: any; userId: number | null }) {
    const warehouseId = await this.resolveWarehouseId(input)
    const wh = await this.whRepo.findOne({ where: { id: warehouseId } as any })
    if (!wh) throw new NotFoundException('Warehouse not found')

    // 1) create session
    const session = await this.sessRepo.save({ warehouseId: wh.id, status: 'draft' })

    // 2) snapshot system qty for relevant products
    const whCode = String(wh.code).toUpperCase() as WarehouseCode

    // Stocks map (system qty + reserved)
    const stocks = await this.stockRepo.find({ where: { warehouse: whCode } as any })
    const stockByProductId = new Map<number, Stock>()
    for (const s of stocks) stockByProductId.set((s.product as any)?.id || (s as any).productId, s)

    // Product scope: по kind для BLANKS/FINISHED, для DEFECT берём finished
    let kind: 'blank' | 'finished' | null = null
    if (whCode === 'BLANKS') kind = 'blank'
    if (whCode === 'FINISHED') kind = 'finished'
    if (whCode === 'DEFECT') kind = 'finished'

    const products = await this.productRepo.find({ where: { ...(kind ? { kind } : {}), isActive: true } as any })
    const linesToInsert: Partial<InventoryLine>[] = []
    for (const p of products) {
      const st = stockByProductId.get(p.id)
      const systemQty = Number((st as any)?.qty || 0)
      linesToInsert.push({ sessionId: session.id, productId: p.id, systemQty, factQty: null, delta: 0 })
    }
    await this.lineRepo.insert(linesToInsert)

    return this.getSession(session.id)
  }

  async getSession(id: number) {
    const s = await this.sessRepo.findOne({ where: { id } as any })
    if (!s) throw new NotFoundException('Inventory session not found')
    if (s.warehouseId == null) {
      throw new BadRequestException('Inventory session missing warehouseId. Create a new inventory session.')
    }
    const wh = await this.whRepo.findOne({ where: { id: s.warehouseId } as any })
    if (!wh) throw new NotFoundException('Warehouse not found')
    const whCode = String(wh.code).toUpperCase() as WarehouseCode

    const lines = await this.lineRepo.find({ where: { sessionId: s.id } as any })
    const productIds = lines.map((l) => l.productId)

    const products = productIds.length ? await this.productRepo.find({ where: { id: In(productIds) } as any }) : []
    const productById = new Map(products.map((p) => [p.id, p]))

    const stocks = productIds.length
      ? await this.stockRepo.find({ where: { warehouse: whCode } as any })
      : []
    const stockByPid = new Map<number, Stock>()
    for (const st of stocks) {
      const pid = (st.product as any)?.id || (st as any).productId
      if (productIds.includes(pid)) stockByPid.set(pid, st)
    }

    const enriched = lines
      .map((l) => {
        const p = productById.get(l.productId)
        const st = stockByPid.get(l.productId)
        const reserved = Number((st as any)?.reservedQty || 0)
        return {
          ...l,
          product: p ? { id: p.id, name: p.name, sku: (p as any).article, kind: p.kind } : null,
          reserved,
          warningFactLessThanReserved: l.factQty != null && Number(l.factQty) < reserved,
        }
      })
      .sort((a: any, b: any) => String(a.product?.name || '').localeCompare(String(b.product?.name || '')))

    const warnings = enriched
      .filter((x: any) => x.warningFactLessThanReserved)
      .map((x: any) => ({ productId: x.productId, reserved: x.reserved, factQty: x.factQty, name: x.product?.name }))

    return {
      session: { id: s.id, status: s.status, createdAt: s.createdAt, warehouse: { id: wh.id, code: wh.code, name: wh.name } },
      lines: enriched,
      warnings,
    }
  }

  async updateLines(sessionId: number, lines: Array<{ productId: any; factQty: any }>) {
    const s = await this.sessRepo.findOne({ where: { id: sessionId } as any })
    if (!s) throw new NotFoundException('Inventory session not found')
    if (s.status !== 'draft') throw new BadRequestException('Inventory session already applied')

    // validate and update
    const byPid = new Map<number, number | null>()
    for (const x of lines) {
      const pid = Number(x?.productId)
      if (!Number.isFinite(pid) || pid <= 0) continue
      const fq = x?.factQty
      if (fq == null || fq === '') {
        byPid.set(pid, null)
      } else {
        const n = Number(fq)
        if (!Number.isFinite(n) || n < 0) throw new BadRequestException('factQty must be a non-negative number')
        byPid.set(pid, Math.floor(n))
      }
    }

    if (byPid.size === 0) return this.getSession(sessionId)

    const existing = await this.lineRepo.find({ where: { sessionId } as any })
    const updates: InventoryLine[] = []
    for (const l of existing) {
      if (!byPid.has(l.productId)) continue
      const factQty = byPid.get(l.productId) ?? null
      l.factQty = factQty
      l.delta = factQty == null ? 0 : Number(factQty) - Number(l.systemQty)
      updates.push(l)
    }
    if (updates.length) await this.lineRepo.save(updates)
    return this.getSession(sessionId)
  }

  async applySession(sessionId: number, userId: number | null) {
    const s = await this.sessRepo.findOne({ where: { id: sessionId } as any })
    if (!s) throw new NotFoundException('Inventory session not found')
    if (s.status !== 'draft') throw new BadRequestException('Inventory session already applied')

    if (s.warehouseId == null) {
      throw new BadRequestException('Inventory session missing warehouseId. Create a new inventory session.')
    }

    const wh = await this.whRepo.findOne({ where: { id: s.warehouseId } as any })
    if (!wh) throw new NotFoundException('Warehouse not found')
    const whCode = String(wh.code).toUpperCase() as WarehouseCode

    const lines = await this.lineRepo.find({ where: { sessionId: s.id } as any })
    const filled = lines.filter((l) => l.factQty != null)
    if (filled.length === 0) throw new BadRequestException('Заполните факт хотя бы по одной позиции')

    // warnings (fact < reserved)
    const stocks = await this.stockRepo.find({ where: { warehouse: whCode } as any })
    const reservedByPid = new Map<number, number>()
    for (const st of stocks) {
      const pid = (st.product as any)?.id || (st as any).productId
      reservedByPid.set(pid, Number((st as any).reservedQty || 0))
    }

    const warnings = filled
      .filter((l) => Number(l.factQty) < Number(reservedByPid.get(l.productId) || 0))
      .map((l) => ({ productId: l.productId, reserved: reservedByPid.get(l.productId) || 0, factQty: l.factQty }))

    // Apply as adjustments for each filled line
    for (const l of filled) {
      const factQty = Number(l.factQty)
      const delta = factQty - Number(l.systemQty)
      if (delta === 0) continue

      // ensure stock row exists
      let stock: Stock | null = await this.stockRepo.findOne({
        where: { warehouse: whCode, product: { id: l.productId } } as any,
      })
      if (!stock) {
        const p = await this.productRepo.findOne({ where: { id: l.productId } as any })
        if (!p) continue
        // TypeORM has create() overloads for both entity and entity[].
        // With loose typing, TS may pick the array overload and infer Stock[] here.
        // Force it to be a single Stock entity.
        const created = this.stockRepo.create({
          warehouse: whCode as any,
          product: p as any,
          qty: 0,
          reservedQty: 0,
          onOrderQty: 0,
          minQty: 0,
        } as any) as unknown as Stock
        stock = (await this.stockRepo.save(created)) as unknown as Stock
      }

      // (TypeScript safety) If we still don't have a stock row for some reason, skip.
      if (!stock) continue

      // movement
      await this.movementRepo.save({
        warehouse: whCode,
        productId: l.productId,
        type: STOCK_MOVEMENT_TYPES.INVENTORY_ADJUST as any,
        qty: delta,
        orderId: null,
        workOrderId: null,
        userId: userId || null,
        note: 'inventory_adjust',
      } as any)

      // set stock qty to fact
      stock.qty = factQty
      await this.stockRepo.save(stock)
    }

    s.status = 'applied'
    await this.sessRepo.save(s)

    return { ok: true, warnings, sessionId: s.id }
  }
}
