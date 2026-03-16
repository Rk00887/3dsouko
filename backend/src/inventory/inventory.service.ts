import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Inventory } from './inventory.entity'
import { CreateInventoryDto, UpdateInventoryDto, StockMoveDto } from './inventory.dto'

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly repo: Repository<Inventory>,
  ) {}

  // ─── 基本CRUD ─────────────────────────────────────────

  findByWarehouse(warehouseId: number): Promise<Inventory[]> {
    return this.repo.find({
      where: { warehouseId },
      relations: ['sku'],
      order: { createdAt: 'DESC' },
    })
  }

  async findOne(id: number): Promise<Inventory> {
    const inv = await this.repo.findOne({ where: { id }, relations: ['sku'] })
    if (!inv) throw new NotFoundException(`Inventory #${id} not found`)
    return inv
  }

  create(dto: CreateInventoryDto): Promise<Inventory> {
    return this.repo.save(this.repo.create(dto))
  }

  async update(id: number, dto: UpdateInventoryDto): Promise<Inventory> {
    const inv = await this.findOne(id)
    Object.assign(inv, dto)
    return this.repo.save(inv)
  }

  async remove(id: number): Promise<void> {
    const inv = await this.findOne(id)
    await this.repo.remove(inv)
  }

  // ─── 入荷 ─────────────────────────────────────────────

  async inbound(body: {
    warehouseId: number
    skuId: number
    quantity: number
    location?: object
    lotNumber?: string
    expiresAt?: string
    minStock?: number
  }): Promise<Inventory> {
    const { warehouseId, skuId, quantity, location, lotNumber, expiresAt, minStock } = body
    let inv = await this.repo.findOne({ where: { warehouseId, skuId, lotNumber: lotNumber || null as any } })
    if (inv) {
      inv.quantity += quantity
      if (location) inv.location = location as any
    } else {
      inv = this.repo.create({
        warehouseId, skuId, quantity,
        location: location as any,
        lotNumber,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        minStock: minStock ?? 0,
      })
    }
    return this.repo.save(inv)
  }

  // ─── 出荷 ─────────────────────────────────────────────

  async outbound(id: number, quantity: number): Promise<Inventory> {
    const inv = await this.findOne(id)
    if (inv.quantity < quantity) {
      throw new BadRequestException(`在庫不足: 要求 ${quantity}, 在庫 ${inv.quantity}`)
    }
    inv.quantity -= quantity
    return this.repo.save(inv)
  }

  // ─── 倉庫内移動 ───────────────────────────────────────

  async move(dto: StockMoveDto): Promise<Inventory> {
    const inv = await this.findOne(dto.inventoryId)
    if (dto.toLocation) inv.location = dto.toLocation as any
    return this.repo.save(inv)
  }

  // ─── 統計 ─────────────────────────────────────────────

  async getSummary(warehouseId: number) {
    const items         = await this.findByWarehouse(warehouseId)
    const totalItems    = items.length
    const totalQuantity = items.reduce((s, i) => s + i.quantity, 0)
    const lowStockCount = items.filter(i => i.quantity <= i.minStock).length
    const byRank = { A: 0, B: 0, C: 0, unknown: 0 }
    items.forEach(i => {
      const rank = (i.sku?.abcRank as 'A'|'B'|'C') || 'unknown'
      byRank[rank] = (byRank[rank] || 0) + i.quantity
    })
    return { totalItems, totalQuantity, lowStockCount, byRank }
  }
}
