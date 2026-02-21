import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id!: number

  @Index()
  @Column({ type: 'int' })
  sessionId!: number

  @Index()
  @Column({ type: 'int' })
  productId!: number

  @Column({ type: 'int' })
  expectedQty!: number

  @Column({ type: 'int', nullable: true })
  actualQty!: number | null
}
