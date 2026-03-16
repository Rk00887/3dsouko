import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,
         CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm'
import { Warehouse } from '../warehouse/warehouse.entity'

@Entity()
export class Layout {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Warehouse, (wh) => wh.layouts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse

  @Column()
  warehouseId: number

  @Column({ length: 200, default: '新規レイアウト' })
  name: string

  @Column({ default: 1 })
  version: number

  @Column({ default: false })
  isActive: boolean

  @Column({ type: 'jsonb', nullable: true })
  objectsJson: object   // layout_objects をJSON配列で保存

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
