import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export type ProductionStatus = 'planned' | 'in_work' | 'ready' | 'canceled'

@Entity('production_tasks')
export class ProductionTask {
  @PrimaryGeneratedColumn()
  id!: number

  @Index()
  @Column({ type: 'int' })
  orderId!: number

  @Index()
  @Column({ type: 'int' })
  productId!: number

  @Column({ type: 'int' })
  qty!: number

  @Column({ type: 'varchar', length: 16, default: 'planned' })
  status!: ProductionStatus

  // дедлайн производства (для очереди/приоритизации)
  @Column({ type: 'timestamptz', nullable: true })
  deadlineAt!: Date | null

  // ответственный (пока строкой — ФИО/ник)
  @Column({ type: 'varchar', length: 128, nullable: true })
  assignee!: string | null

  // когда задача была запущена / завершена / отменена
  @Column({ type: 'timestamptz', nullable: true })
  startedAt!: Date | null

  @Column({ type: 'timestamptz', nullable: true })
  finishedAt!: Date | null

  @Column({ type: 'timestamptz', nullable: true })
  canceledAt!: Date | null

  // когда перевели готовое на склад
  @Column({ type: 'timestamptz', nullable: true })
  movedToStockAt!: Date | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date
}
