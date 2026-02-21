import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity('settings_kv')
export class SettingsKv {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  key!: string

  @Column({ type: 'jsonb', nullable: true })
  value!: any

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date
}
