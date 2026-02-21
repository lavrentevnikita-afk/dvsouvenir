import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Category } from './category.entity'
import { ProductImage } from './product-image.entity'

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true })
  slug!: string

  @Column()
  name!: string

  @Column({ unique: true })
  article!: string

  @Column({ type: 'text', nullable: true })
  description: string | null = null

  @Column({ type: 'jsonb', nullable: true })
  specs: Record<string, string> | null = null

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price!: string

  // Вес товара (кг). Пока только хранение и отображение (без расчётов).
  // float важен для дробных значений: 0.25 / 1.3 кг
  @Column({ type: 'float', nullable: true })
  weight?: number

  // Город/склад, к которому товар относится по умолчанию (для приоритизации в каталоге).
  // Не фильтрует каталог — только влияет на сортировку при выборе города.
  @Column({ type: 'varchar', length: 32, nullable: true })
  city: string | null = null

  @Column({ name: 'is_available', default: true })
  isAvailable!: boolean

  // Управление видимостью товара в каталоге (активен/скрыт)
  @Column({ name: 'is_active', default: true })
  isActive!: boolean

  // Вид товара: заготовка (используется в производстве) или готовый товар (продаётся)
  // stored as string for simplicity
  @Column({ type: 'varchar', length: 16, default: 'finished' })
  kind!: 'blank' | 'finished'

  @Column({ type: 'int', default: 0 })
  popularity!: number

  

@Column({ type: 'boolean', default: false })
archived!: boolean

@Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  category!: Category

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true, eager: true })
  images!: ProductImage[]
}
