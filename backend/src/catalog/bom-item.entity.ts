import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Product } from './product.entity'

// BOM (Bill of Materials) item: links a finished product to its component (usually a blank product).
@Entity('bom_items')
@Index(['productId', 'componentProductId'], { unique: true })
export class BomItem {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'int' })
  productId!: number

  @ManyToOne(() => Product, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'productId' })
  product!: Product

  @Column({ type: 'int' })
  componentProductId!: number

  @ManyToOne(() => Product, { onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'componentProductId' })
  componentProduct!: Product

  // qty per 1 unit of finished product (usually 1)
  @Column({ type: 'numeric', precision: 10, scale: 4, default: 1 })
  qty!: string
}
