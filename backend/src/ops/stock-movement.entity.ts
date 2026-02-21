import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import type { StockMovementType } from '../shared/enums'

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id!: number

  @Index()
  @Column({ type: 'varchar', length: 32 })
  warehouse!: string

  @Index()
  @Column({ type: 'int' })
  productId!: number

  @Column({ type: 'varchar', length: 16 })
  type!: StockMovementType

  @Column({ type: 'int' })
  qty!: number

  @Index()
  @Column({ type: 'int', nullable: true })
  orderId!: number | null

  // Work Order (WO) that produced/consumed this movement (when applicable)
  @Index()
  @Column({ type: 'int', nullable: true })
  workOrderId!: number | null

  // кто сделал операцию (для ручных операций/инвентаризации)
  @Index()
  @Column({ type: 'int', nullable: true })
  userId!: number | null

  @Column({ type: 'text', nullable: true })
  note!: string | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date
}
