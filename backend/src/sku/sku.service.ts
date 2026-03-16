import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Sku } from './sku.entity'
import { CreateSkuDto } from './sku.dto'

@Injectable()
export class SkuService {
  constructor(
    @InjectRepository(Sku)
    private readonly repo: Repository<Sku>,
  ) {}

  findAll(): Promise<Sku[]> {
    return this.repo.find({ order: { skuCode: 'ASC' } })
  }

  async findOne(id: number): Promise<Sku> {
    const sku = await this.repo.findOne({ where: { id } })
    if (!sku) throw new NotFoundException(`SKU #${id} not found`)
    return sku
  }

  create(dto: CreateSkuDto): Promise<Sku> {
    return this.repo.save(this.repo.create(dto))
  }

  async update(id: number, dto: Partial<CreateSkuDto>): Promise<Sku> {
    const sku = await this.findOne(id)
    Object.assign(sku, dto)
    return this.repo.save(sku)
  }

  async remove(id: number): Promise<void> {
    const sku = await this.findOne(id)
    await this.repo.remove(sku)
  }

  /** SKU数から必要棚数・面積を計算 */
  calculateCapacity(params: {
    skuQty: number
    qtyPerCarton: number
    palletCapacity: number
    racksPerPallet: number
    rackWidth: number
    aisleWidth: number
    warehouseDepth: number
  }) {
    const { skuQty, qtyPerCarton, palletCapacity, racksPerPallet,
            rackWidth, aisleWidth, warehouseDepth } = params

    const cartons  = Math.ceil(skuQty / qtyPerCarton)
    const pallets  = Math.ceil(cartons / palletCapacity)
    const racks    = Math.ceil(pallets / racksPerPallet)
    const rows     = warehouseDepth
      ? Math.ceil(racks / Math.floor(warehouseDepth / 1.0))
      : racks
    const reqWidth = rows * (rackWidth + aisleWidth)
    const reqArea  = reqWidth * (warehouseDepth || 50)

    return { cartons, pallets, racks, rows, reqWidth, reqArea }
  }
}
