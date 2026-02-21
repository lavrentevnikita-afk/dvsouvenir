import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity('password_resets')
export class PasswordReset {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  email!: string

  @Column()
  token!: string

  @Column({ default: false })
  used!: boolean

  @Column()
  expiresAt!: Date

  @CreateDateColumn()
  createdAt!: Date
}
