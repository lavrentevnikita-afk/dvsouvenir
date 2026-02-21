import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Warehouse } from './warehouse.entity'
import { SettingsKv } from '../admin-settings/settings-kv.entity'
import { Stock } from '../b2b/stock.entity'
import { InventoryReservation } from './inventory-reservation.entity'
import { WAREHOUSE_CODES, WAREHOUSE_TYPES, WarehouseCode, WarehouseType } from '../shared/enums'
import { City } from '../catalog/city.entity'

/**
 * Этап A — подготовка схемы и «жёстких» складов.
 *
 * Делается на старте приложения, потому что проект использует synchronize=true
 * (без миграций). Логика идемпотентная и безопасная для повторных запусков.
 */
@Injectable()
export class OpsBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(OpsBootstrapService.name)

  constructor(
    @InjectRepository(Warehouse) private readonly whRepo: Repository<Warehouse>,
    @InjectRepository(SettingsKv) private readonly kvRepo: Repository<SettingsKv>,
    @InjectRepository(Stock) private readonly stockRepo: Repository<Stock>,
    @InjectRepository(InventoryReservation) private readonly resRepo: Repository<InventoryReservation>,
    @InjectRepository(City) private readonly cityRepo: Repository<City>,
  ) {}

  private async upsertMainWarehouse(code: WarehouseCode, name: string, type: WarehouseType): Promise<Warehouse> {
    // Важно: Repository.create() у TypeORM перегружен (array | object) и TS иногда
    // неверно выбирает перегрузку, из-за чего "wh" внезапно становится Warehouse[].
    // Чтобы стабильно компилировалось — создаём сущность без аргументов и заполняем поля.
    const c = String(code).trim().toUpperCase() as WarehouseCode
    const existing = await this.whRepo.findOne({ where: { code: c } })

    // Не используем `existing ?? repo.create()` — иногда TS выводит тип как `Warehouse | Warehouse[]`
    // из-за перегрузок `create()`. Делаем ветвление явно.
    let wh: Warehouse
    if (existing) {
      wh = existing
    } else {
      wh = this.whRepo.create()
    }
    wh.code = c
    wh.name = name
    wh.type = type
    // regionCode в старых БД может быть null/undefined
    ;(wh as any).regionCode = (wh as any).regionCode ?? ''

    return this.whRepo.save(wh)
  }

  async onModuleInit() {
    try {
      // 1) Ensure exactly 3 main warehouses exist.
      const blanks = await this.upsertMainWarehouse(WAREHOUSE_CODES.BLANKS, 'Заготовки', WAREHOUSE_TYPES.BLANKS)
      const finished = await this.upsertMainWarehouse(WAREHOUSE_CODES.FINISHED, 'Готовая продукция', WAREHOUSE_TYPES.FINISHED)
      const defect = await this.upsertMainWarehouse(WAREHOUSE_CODES.DEFECT, 'Брак', WAREHOUSE_TYPES.DEFECT)

      // 2) Persist ids in settings.main_warehouses
      const kv = (await this.kvRepo.findOne({ where: { key: 'main_warehouses' } as any })) ||
        this.kvRepo.create({ key: 'main_warehouses', value: {} })
      kv.value = {
        blanksWarehouseId: Number((blanks as any).id),
        finishedWarehouseId: Number((finished as any).id),
        defectWarehouseId: Number((defect as any).id),
      }
      await this.kvRepo.save(kv)

      // 2.1) Ensure at least one city exists (for public city picker)
      const cityCount = await this.cityRepo.count()
      if (cityCount === 0) {
        const c = this.cityRepo.create({ code: 'VVO', name: 'Владивосток', regionCode: '25' })
        await this.cityRepo.save(c)
      }

      // 3) Re-point reservations to main warehouses (if any legacy data exists)
      await this.resRepo
        .createQueryBuilder()
        .update(InventoryReservation)
        .set({ warehouseId: Number((finished as any).id) } as any)
        .where('kind = :k', { k: 'FINISHED' })
        .andWhere('warehouseId <> :wid', { wid: Number((finished as any).id) })
        .execute()

      await this.resRepo
        .createQueryBuilder()
        .update(InventoryReservation)
        .set({ warehouseId: Number((blanks as any).id) } as any)
        .where('kind = :k', { k: 'BLANKS' })
        .andWhere('warehouseId <> :wid', { wid: Number((blanks as any).id) })
        .execute()

      // 4) Remove legacy warehouses (MSK/STORE/cities/etc.) and their stocks
      // Используем строки/Set, чтобы не упираться в строгие union-типы TS при сравнении.
      const allowedCodes = new Set<string>([WAREHOUSE_CODES.BLANKS, WAREHOUSE_CODES.FINISHED, WAREHOUSE_CODES.DEFECT].map(String))
      await this.stockRepo
        .createQueryBuilder()
        .delete()
        .from(Stock)
        .where('warehouse NOT IN (:...codes)', { codes: Array.from(allowedCodes) })
        .execute()

      // load all and delete others
      const allWh = await this.whRepo.find()
      const toDelete = allWh.filter((w: any) => {
        const codeUpper = String(w.code).trim().toUpperCase()
        return !allowedCodes.has(codeUpper)
      })
      if (toDelete.length) {
        // Ensure no reservations still point to them (safety)
        await this.resRepo
          .createQueryBuilder()
          .delete()
          .from(InventoryReservation)
          .where('warehouseId NOT IN (:...ids)', { ids: [Number((blanks as any).id), Number((finished as any).id), Number((defect as any).id)] })
          .execute()
        await this.whRepo.remove(toDelete as any)
      }

      this.logger.log(
        `Main warehouses ensured: BLANKS=${(blanks as any).id}, FINISHED=${(finished as any).id}, DEFECT=${(defect as any).id}. Removed legacy warehouses: ${toDelete.length}`,
      )
    } catch (e: any) {
      this.logger.warn(`Ops bootstrap failed: ${e?.message ?? e}`)
    }
  }
}
