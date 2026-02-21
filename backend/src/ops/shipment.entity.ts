import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

// ready   -> готово к отгрузке (создано)
// partial -> частичная отгрузка (есть отгруженные позиции, но не всё)
// shipped  -> отгружено полностью
// delivered -> доставлено
export type ShipmentStatus = 'ready' | 'partial' | 'shipped' | 'delivered' | 'created'

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn()
  id!: number

  @Index('UQ_shipments_orderId', { unique: true })
  @Column({ type: 'int' })
  orderId!: number

  @Column({ type: 'varchar', length: 16, default: 'ready' })
  status!: ShipmentStatus

  // плановая дата отгрузки (можно выставлять позже)
  @Column({ type: 'timestamptz', nullable: true })
  plannedAt!: Date | null

  @Column({ type: 'timestamptz', nullable: true })
  shippedAt!: Date | null

  @Column({ type: 'timestamptz', nullable: true })
  deliveredAt!: Date | null

  @Column({ type: 'int', nullable: true })
  confirmedByUserId!: number | null

  @Column({ type: 'varchar', length: 120, nullable: true })
  waybillNumber!: string | null

  @Column({ type: 'text', nullable: true })
  comment!: string | null

  @Column({ type: 'text', nullable: true })
  photoUrl!: string | null

  // накопленная информация по частичным отгрузкам
  // productId -> shippedQty
  @Column({ type: 'jsonb', nullable: true })
  shippedItems!: Record<string, number> | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date
}
