import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
         UpdateDateColumn, OneToMany } from 'typeorm'
import { Layout } from '../layout/layout.entity'

@Entity()
export class Warehouse {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 200 })
  name: string

  @Column('decimal', { precision: 8, scale: 2 })
  width: number

  @Column('decimal', { precision: 8, scale: 2 })
  length: number

  @Column('decimal', { precision: 8, scale: 2 })
  height: number

  @Column({ length: 50, default: 'concrete' })
  floorType: string

  @OneToMany(() => Layout, (layout) => layout.warehouse)
  layouts: Layout[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
