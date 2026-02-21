import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export interface OrderItemRecord {
  productId: number
  quantity: number
  price: string
  name: string
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  customerName!: string

  @Column({ length: 255 })
  email!: string

  @Column({ type: 'varchar', length: 40, nullable: true })
  phone!: string | null

  @Column()
  address!: string

  @Column({ type: 'text', nullable: true })
  comment!: string | null

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  totalPrice!: string

  // B2B скидка (фиксируем на момент создания заказа, чтобы чек/счёт были воспроизводимыми)
  @Column({ type: 'int', default: 0 })
  discountPercent!: number

  // CRM: ссылка на магазин (store_profiles.id)
  // nullable=true для совместимости со старыми заказами и розницей
  @Column({ type: 'int', nullable: true })
  shopId!: number | null

  @Column({ default: 'new' })
  status!: string

  // Этап 3: резервы/комплектация (nullable для совместимости)
  // если есть проблемы с материалами/рецептом — сюда пишем причины
  @Column({ type: 'jsonb', nullable: true })
  allocationIssues!: any[] | null

  // Этап 5: сборка/комплектация (OMS-like)
  @Column({ type: 'int', nullable: true })
  priority!: number | null

  @Column({ type: 'timestamptz', nullable: true })
  deadlineAt!: Date | null

  @Column({ type: 'varchar', length: 120, nullable: true })
  assignee!: string | null

  // чек-лист сборки по позициям (productId -> checked)
  @Column({ type: 'jsonb', nullable: true })
  pickingChecklist!: Record<string, boolean> | null

  // требования к упаковке/комплектации (для production UI)
  // nullable=true чтобы TypeORM synchronize мог добавить колонку в уже существующую таблицу
  @Column({ type: 'jsonb', nullable: true })
  packagingRequirements!: any | null

  // Этап 4: операционка (nullable, чтобы не ломать старые записи)
  @Column({ type: 'timestamptz', nullable: true })
  shippedAt!: Date | null

  @Column({ type: 'timestamptz', nullable: true })
  closedAt!: Date | null

  @Column({ type: 'jsonb' })
  items!: OrderItemRecord[]

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date
}
