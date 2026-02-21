import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 16 })
  @Index({ unique: true })
  code!: string

  @Column({ type: 'varchar', length: 128 })
  name!: string

  @Column({ type: 'varchar', length: 16, default: '' })
  regionCode!: string
}
