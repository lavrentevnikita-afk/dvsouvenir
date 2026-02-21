import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

export type UserRole = 'customer' | 'store' | 'manager' | 'production' | 'admin'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 120 })
  name!: string

  @Index({ unique: true })
  @Column({ length: 180 })
  email!: string

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string

  // ✅ новое поле (не ломает старых пользователей — будет customer)
  @Column({ type: 'varchar', length: 20, default: 'customer' })
  role!: UserRole

  // Профиль (для автоподстановки при оформлении заказа)
  @Column({ type: 'varchar', length: 40, nullable: true })
  phone: string | null = null

  // Выбранный город (для приоритета ассортимента)
  @Column({ type: 'varchar', length: 80, nullable: true })
  city: string | null = null

  // Адрес по умолчанию
  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null = null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date
}
