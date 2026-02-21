import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Order } from '../orders/order.entity'
import { Product } from '../catalog/product.entity'
import { Warehouse } from './warehouse.entity'

export type ReservationKind = 'FINISHED' | 'BLANKS'
export type ReservationStatus = 'active' | 'released' | 'consumed'

@Entity('inventory_reservations')
@Index(['orderId'])
@Index(['warehouseId'])
@Index(['orderId', 'warehouseId'])
export class InventoryReservation {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'int' })
  orderId!: number

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  order!: Order

  @Column({ type: 'int' })
  productId!: number

  @ManyToOne(() => Product, { eager: true, onDelete: 'RESTRICT' })
  product!: Product

  @Column({ type: 'int' })
  warehouseId!: number

  @ManyToOne(() => Warehouse, { eager: true, onDelete: 'RESTRICT' })
  warehouse!: Warehouse

  @Column({ type: 'numeric', precision: 10, scale: 4 })
  qty!: string

  @Column({ type: 'varchar', length: 16 })
  kind!: ReservationKind

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: ReservationStatus

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date
}
