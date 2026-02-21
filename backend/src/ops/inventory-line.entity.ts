import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity('inventory_lines')
@Index(['sessionId', 'productId'], { unique: true })
export class InventoryLine {
  @PrimaryGeneratedColumn()
  id!: number

  @Index()
  @Column({ type: 'int' })
  sessionId!: number

  @Index()
  @Column({ type: 'int' })
  productId!: number

  // Остаток по системе на момент старта инвентаризации
  @Column({ type: 'int', default: 0 })
  systemQty!: number

  // Факт (вводится человеком). Nullable = ещё не заполнено.
  @Column({ type: 'int', nullable: true })
  factQty!: number | null

  // factQty - systemQty (для удобства UI)
  @Column({ type: 'int', default: 0 })
  delta!: number
}
