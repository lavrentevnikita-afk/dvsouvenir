import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('promo_banners')
export class PromoBanner {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 200, default: '' })
  title!: string

  // banner|badge (плашка)
  @Column({ type: 'varchar', length: 20, default: 'banner' })
  type!: string

  // for "badge" type (optional)
  @Column({ type: 'text', nullable: true })
  text!: string | null

  // URL to image (usually /uploads/static/promo/<file> when ENABLE_LOCAL_UPLOADS=true)
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl!: string | null

  // Optional click-through URL
  @Column({ type: 'varchar', length: 500, default: '' })
  linkUrl!: string

  @Column({ type: 'int', default: 0 })
  sortOrder!: number

  @Column({ type: 'boolean', default: true })
  isActive!: boolean

  // Optional schedule window (inclusive). If null -> always.
  @Column({ type: 'timestamptz', nullable: true })
  startAt!: Date | null

  @Column({ type: 'timestamptz', nullable: true })
  endAt!: Date | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date
}
