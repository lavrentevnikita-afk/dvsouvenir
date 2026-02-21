import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm'
import { User } from '../users/user.entity'
import { Product } from '../catalog/product.entity'

@Entity('wishlist')
export class WishlistItem {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  userId!: number

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User

  @Column()
  productId!: number

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product!: Product

  @CreateDateColumn()
  createdAt!: Date
}
