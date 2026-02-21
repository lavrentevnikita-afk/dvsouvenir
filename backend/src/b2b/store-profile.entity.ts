import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from '../users/user.entity'

// CRM-статусы магазина: заявка → активный → заблокирован
export type StoreStatus = 'lead' | 'active' | 'blocked'

@Entity('store_profiles')
export class StoreProfile {
  @PrimaryGeneratedColumn()
  id!: number

  @OneToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'varchar', length: 20, default: 'lead' })
  status!: StoreStatus

  // заметки модерации (причина отказа / запрос уточнения / внутренний комментарий)
  @Column({ name: 'moderation_note', type: 'text', nullable: true })
  moderationNote: string | null = null

  // CRM-заметка менеджера/админа (не путать с moderationNote)
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null = null

  @Column({ name: 'rejected_reason_code', type: 'varchar', length: 64, nullable: true })
  rejectedReasonCode: string | null = null

  @Column({ name: 'rejected_reason_text', type: 'text', nullable: true })
  rejectedReasonText: string | null = null

  // реквизиты / общая инфа (минимально)
  @Column({ name: 'company_name', type: 'varchar', length: 255 })
  companyName!: string

  // Публичные данные (для кабинета / отображения)
  @Column({ name: 'display_name', type: 'varchar', length: 255, nullable: true })
  displayName: string | null = null

  // Лого можно хранить как URL или data-url (base64)
  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string | null = null

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null = null

  @Column({ type: 'varchar', length: 80, nullable: true })
  city: string | null = null

  @Column({ type: 'varchar', length: 80, nullable: true })
  phone: string | null = null

  @Column({ type: 'varchar', length: 180, nullable: true })
  website: string | null = null

  @Column({ type: 'varchar', length: 32, nullable: true })
  inn: string | null = null

  @Column({ type: 'varchar', length: 32, nullable: true })
  kpp: string | null = null

  @Column({ type: 'varchar', length: 32, nullable: true })
  ogrn: string | null = null

  @Column({ type: 'jsonb', nullable: true })
  contacts: Record<string, any> | null = null

  @Column({ name: 'price_group_id', type: 'int', nullable: true })
  priceGroupId: number | null = null

  // Скидка для магазина (процент на все товары в B2B)
  // 0..100. Пока используется как «операционный» параметр для менеджера.
  @Column({ name: 'discount_percent', type: 'int', default: 0 })
  discountPercent!: number

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date
}
