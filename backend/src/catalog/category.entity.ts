import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Product } from './product.entity'

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number

  // NOTE: because this field is typed as a union (string | null),
  // TypeScript emits `design:type` as Object. We MUST set the column type explicitly
  // or TypeORM will try to map it as "Object" which Postgres doesn't support.
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  slug!: string | null

  @Column()
  name!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  // Static image for category cards / promo blocks (stored locally via /api/admin/media/upload)
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl!: string | null

  // parent = NULL -> root category
  // parent != NULL -> subcategory
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: Category | null

  @OneToMany(() => Category, (category) => category.parent)
  children!: Category[]

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number

  @Column({ name: 'is_active', default: true })
  isActive!: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[]
}
