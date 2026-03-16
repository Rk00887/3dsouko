import { Entity, PrimaryGeneratedColumn, Column,
         CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class Sku {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 100, unique: true })
  skuCode: string

  @Column({ length: 300 })
  name: string

  @Column({ length: 100, nullable: true })
  category: string

  @Column({ type: 'char', length: 1, nullable: true })
  abcRank: string   // A / B / C

  @Column('decimal', { precision: 8, scale: 3, nullable: true })
  length: number

  @Column('decimal', { precision: 8, scale: 3, nullable: true })
  width: number

  @Column('decimal', { precision: 8, scale: 3, nullable: true })
  height: number

  @Column('decimal', { precision: 8, scale: 3, nullable: true })
  weight: number

  @Column({ default: 1 })
  boxQty: number

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
