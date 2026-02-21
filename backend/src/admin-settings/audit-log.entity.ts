import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number

  @Index()
  @Column({ type: 'int', nullable: true })
  userId!: number | null

  @Index()
  @Column({ type: 'varchar', length: 120 })
  action!: string

  @Index()
  @Column({ type: 'varchar', length: 120, nullable: true })
  entity!: string | null

  @Column({ type: 'jsonb', nullable: true })
  meta!: any

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date
}
