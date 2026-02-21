import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

export type SystemEventLevel = 'info' | 'warning' | 'error' | 'critical'

// Простая таблица для ошибок/событий системы.
// Используется виджетом «Что требует внимания сейчас».
@Entity('system_events')
export class SystemEvent {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 20, default: 'error' })
  level!: SystemEventLevel

  @Column({ type: 'varchar', length: 500, default: '' })
  message!: string

  @Column({ type: 'jsonb', nullable: true })
  meta!: any

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date
}
