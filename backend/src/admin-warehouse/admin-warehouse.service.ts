import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Stock } from '../b2b/stock.entity'
import { Product } from '../catalog/product.entity'
import { OpsService } from '../ops/ops.service'

@Injectable()
export class AdminWarehouseService {
  constructor(
    private readonly ops: OpsService,
    @InjectRepository(Stock)
    private readonly stocksRepo: Repository<Stock>,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  async listItems(warehouse: 'BLANKS' | 'FINISHED' | 'DEFECT') {
    const wh = String(warehouse).trim().toUpperCase() as any
    await this.ops.ensureWarehouse(wh)

    // Map logical warehouses to catalog product kinds.
    // BLANKS -> blanks (заготовки), FINISHED/DEFECT -> finished (готовые изделия/брак)
    const kind: 'blank' | 'finished' = wh === 'BLANKS' ? 'blank' : 'finished'

    // IMPORTANT: UI expects that the warehouse "Товары" tab shows *all catalog products*
    // even if there is no row yet in stocks for that warehouse (qty=0 by default).
    const products = await this.productsRepo.find({
      where: { isActive: true, kind } as any,
      order: { name: 'ASC' },
    })

    const productIds = products.map((p) => p.id)
    const stocks = productIds.length
      ? await this.stocksRepo
          .createQueryBuilder('s')
          .leftJoinAndSelect('s.product', 'p')
          .where('s.warehouse = :wh', { wh })
          .andWhere('p.id IN (:...ids)', { ids: productIds })
          .getMany()
      : []

    const byProductId = new Map<number, Stock>()
    for (const s of stocks) byProductId.set((s as any).product?.id, s)

    const items = products.map((p) => {
      const s = byProductId.get(p.id)
      const qty = Number((s as any)?.qty || 0)
      const reserved = Number((s as any)?.reservedQty || 0)
      const free = Math.max(0, qty - reserved)
      const min = Number((s as any)?.minQty || 0)
      const onOrder = Number((s as any)?.onOrderQty || 0)

      const base: any = {
        product: {
          id: Number(p.id),
          name: String(p.name || ''),
          sku: String((p as any).article || ''),
          kind: String((p as any).kind || ''),
        },
        qty,
        reserved,
        free,
      }

      if (wh === 'BLANKS') {
        base.purchaseNeeded = Boolean((onOrder > 0) || (min > 0 && free < min))
      }

      return base
    })

    return { warehouse: wh, items }
  }

  async listMovements(params: {
    warehouse: 'BLANKS' | 'FINISHED' | 'DEFECT'
    productId?: string
    orderId?: string
    workOrderId?: string
    dateFrom?: string
    dateTo?: string
  }) {
    // Delegate to OpsService movement log, but keep endpoint under /api/admin/warehouse
    return this.ops.listMovements({
      warehouse: params.warehouse,
      productId: params.productId,
      orderId: params.orderId,
      workOrderId: params.workOrderId,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      limit: '200',
    })
  }
}
