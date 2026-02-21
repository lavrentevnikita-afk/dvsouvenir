import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Product } from '../catalog/product.entity'

@Entity('stocks')
@Index(['warehouse', 'product'], { unique: true })
export class Stock {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Product, { eager: true, onDelete: 'CASCADE' })
  product!: Product

  @Column({ type: 'varchar', length: 32 })
  warehouse!: string // например: "MAIN" (производство), "SHOP-001" (магазин)

  @Column({ type: 'int', default: 0 })
  qty!: number

  // Этап 4: резервы и под заказ (nullable/default чтобы не ломать старую БД)
  @Column({ type: 'int', default: 0 })
  reservedQty!: number

  @Column({ type: 'int', default: 0 })
  onOrderQty!: number

  // Минимальная норма по позиции (ниже — дефицит)
  @Column({ type: 'int', default: 0 })
  minQty!: number

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date
}
