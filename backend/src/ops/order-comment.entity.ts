import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity('order_comments')
export class OrderComment {
  @PrimaryGeneratedColumn()
  id!: number

  @Index()
  @Column({ type: 'int' })
  orderId!: number

  @Index()
  @Column({ type: 'int' })
  authorUserId!: number

  @Column({ type: 'text' })
  text!: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date
}
