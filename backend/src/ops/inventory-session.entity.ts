import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

export type InventorySessionStatus = 'draft' | 'applied'

@Entity('inventory_sessions')
export class InventorySession {
  @PrimaryGeneratedColumn()
  id!: number

  // FK на warehouses.id (см. ops/warehouse.entity.ts)
  @Index()
  // nullable=true чтобы TypeORM synchronize мог добавить колонку в уже существующую таблицу
  // без падения на NOT NULL (в проде лучше делать миграцией + backfill).
  @Column({ type: 'int', nullable: true })
  warehouseId!: number | null

  @Index()
  @Column({ type: 'varchar', length: 16, default: 'draft' })
  status!: InventorySessionStatus

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date
}
