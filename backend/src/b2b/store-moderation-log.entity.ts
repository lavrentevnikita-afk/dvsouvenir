import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

export type StoreModerationAction = 'approve' | 'reject' | 'request_info'

@Entity('store_moderation_logs')
export class StoreModerationLog {
  @PrimaryGeneratedColumn()
  id!: number

  @Index()
  @Column({ type: 'int' })
  storeProfileId!: number

  @Column({ type: 'varchar', length: 32 })
  action!: StoreModerationAction

  @Column({ type: 'text', nullable: true })
  message!: string | null

  @Index()
  @Column({ type: 'int', nullable: true })
  userId!: number | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date
}
