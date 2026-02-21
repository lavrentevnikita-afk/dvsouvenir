import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/user.entity'
import { Warehouse } from '../ops/warehouse.entity'
import { AuditLog } from './audit-log.entity'
import { SettingsKv } from './settings-kv.entity'

@Injectable()
export class AdminSettingsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Warehouse) private readonly whRepo: Repository<Warehouse>,
    @InjectRepository(SettingsKv) private readonly kvRepo: Repository<SettingsKv>,
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async listUsers() {
    const rows = await this.userRepo.find({ order: { id: 'DESC' }, take: 500 })
    return {
      users: rows.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }))
    }
  }

  async setUserRole(actor: User, userId: number, role: string) {
    const u = await this.userRepo.findOne({ where: { id: userId } })
    if (!u) throw new NotFoundException('Пользователь не найден')
    u.role = role as any
    await this.userRepo.save(u)
    await this.auditRepo.save(this.auditRepo.create({
      userId: actor?.id ?? null,
      action: 'user.role.set',
      entity: `user:${u.id}`,
      meta: { role },
    }))
    return { ok: true }
  }

  async getIssueReasons() {
    const kv = await this.kvRepo.findOne({ where: { key: 'issue_reasons' } })
    const value = kv?.value
    const reasons = Array.isArray(value) ? value : [
      { code: 'production', label: 'производство' },
      { code: 'defect', label: 'брак' },
      { code: 'other', label: 'прочее' },
    ]
    return { reasons }
  }

  async setIssueReasons(actor: User, reasons: any[]) {
    const kv = (await this.kvRepo.findOne({ where: { key: 'issue_reasons' } })) || this.kvRepo.create({ key: 'issue_reasons', value: [] })
    kv.value = Array.isArray(reasons) ? reasons : []
    await this.kvRepo.save(kv)
    await this.auditRepo.save(this.auditRepo.create({
      userId: actor?.id ?? null,
      action: 'dict.issue_reasons.set',
      entity: 'settings_kv:issue_reasons',
      meta: { count: Array.isArray(reasons) ? reasons.length : 0 },
    }))
    return { ok: true }
  }

  async listAudit(limit = 200) {
    const rows = await this.auditRepo.find({ order: { createdAt: 'DESC' }, take: Math.min(Math.max(limit, 1), 500) })
    return { logs: rows }
  }

  // --- System settings ---

  async getMainWarehouses() {
    const kv = await this.kvRepo.findOne({ where: { key: 'main_warehouses' } })
    const value = (kv?.value && typeof kv.value === 'object') ? kv.value : null

    // Provide sensible defaults by codes if setting is empty.
    const all = await this.whRepo.find({ order: { id: 'ASC' } })
    const findId = (code: string) => all.find((w) => String(w.code).toUpperCase() === code)?.id ?? null

    return {
      mainWarehouses: {
        blanksWarehouseId: Number(value?.blanksWarehouseId) || findId('BLANKS'),
        finishedWarehouseId: Number(value?.finishedWarehouseId) || findId('FINISHED'),
        defectWarehouseId: value?.defectWarehouseId ? Number(value.defectWarehouseId) : findId('DEFECT'),
      },
      warehouses: all.map((w) => ({ id: w.id, code: w.code, name: w.name, type: (w as any).type })),
    }
  }

  async setMainWarehouses(actor: User, payload: any) {
    const blanksWarehouseId = Number(payload?.blanksWarehouseId || 0)
    const finishedWarehouseId = Number(payload?.finishedWarehouseId || 0)
    const defectWarehouseId = payload?.defectWarehouseId ? Number(payload.defectWarehouseId) : null

    if (!blanksWarehouseId || !finishedWarehouseId) {
      throw new NotFoundException('Укажите id складов BLANKS и FINISHED')
    }

    const ids = [blanksWarehouseId, finishedWarehouseId, ...(defectWarehouseId ? [defectWarehouseId] : [])]
    const found = await this.whRepo.find({ where: ids.map((id) => ({ id })) as any })
    if (found.length !== ids.length) {
      throw new NotFoundException('Один или несколько складов не найдены')
    }

    const kv = (await this.kvRepo.findOne({ where: { key: 'main_warehouses' } })) || this.kvRepo.create({ key: 'main_warehouses', value: {} })
    kv.value = { blanksWarehouseId, finishedWarehouseId, defectWarehouseId }
    await this.kvRepo.save(kv)

    await this.auditRepo.save(this.auditRepo.create({
      userId: actor?.id ?? null,
      action: 'settings.main_warehouses.set',
      entity: 'settings_kv:main_warehouses',
      meta: { blanksWarehouseId, finishedWarehouseId, defectWarehouseId },
    }))
    return { ok: true }
  }
}
