import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export type WorkOrderStatus = 'planned' | 'in_progress' | 'done' | 'blocked'

@Entity('work_orders')
@Index(['orderId'])
@Index(['productId'])
@Index(['orderId', 'productId'], { unique: true })
@Index(['status'])
export class WorkOrder {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'int' })
  orderId!: number

  @Column({ type: 'int' })
  productId!: number // готовый товар (FINISHED)

  @Column({ type: 'numeric', precision: 12, scale: 4, default: 0 })
  qtyPlanned!: string

  @Column({ type: 'numeric', precision: 12, scale: 4, default: 0 })
  qtyDone!: string

  // Количество единиц, ушедших в брак при выпуске.
  // Не закрывает потребность заказа, но позволяет видеть потери.
  @Column({ type: 'numeric', precision: 12, scale: 4, default: 0 })
  qtyDefect!: string

  @Column({ type: 'varchar', length: 16, default: 'planned' })
  status!: WorkOrderStatus

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date
}
