import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,
         JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Sku } from '../sku/sku.entity'

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  warehouseId: number

  @ManyToOne(() => Sku, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'sku_id' })
  sku: Sku

  @Column()
  skuId: number

  // ロケーション（棚ID・段・スロットをJSON管理）
  @Column({ type: 'jsonb', nullable: true })
  location: {
    aisle?: string    // 通路ラベル（A, B, C...）
    rack?: number     // 棚番
    level?: number    // 段
    slot?: number     // スロット
    x?: number
    z?: number
  }

  @Column({ default: 0 })
  quantity: number

  @Column({ default: 0 })
  minStock: number

  @Column({ type: 'varchar', length: 50, nullable: true })
  lotNumber: string

  @Column({ type: 'date', nullable: true })
  expiresAt: Date

  @Column({ type: 'varchar', length: 20, default: 'stored' })
  status: string  // stored / reserved / picking

  @UpdateDateColumn()
  updatedAt: Date

  @CreateDateColumn()
  createdAt: Date
}
