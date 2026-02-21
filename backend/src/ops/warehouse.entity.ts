import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { WAREHOUSE_TYPES, WarehouseType } from '../shared/enums'

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn()
  id!: number

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  code!: string // "MAIN", "SPB" и т.п.

  // Тип склада (служебный):
  // - BLANKS: заготовки
  // - FINISHED: готовая продукция
  // - DEFECT: брак (позже)
  @Index()
  @Column({ type: 'varchar', length: 16, default: WAREHOUSE_TYPES.FINISHED })
  type!: WarehouseType

  @Column({ type: 'varchar', length: 120, default: '' })
  name!: string

  // Региональный код (например, 79) — участвует в артикулах товаров этого города: 79-0001
  @Column({ type: 'varchar', length: 8, default: '' })
  regionCode!: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date
}
