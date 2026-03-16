import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Layout } from './layout.entity'
import { SaveLayoutDto } from './layout.dto'

@Injectable()
export class LayoutService {
  constructor(
    @InjectRepository(Layout)
    private readonly repo: Repository<Layout>,
  ) {}

  findByWarehouse(warehouseId: number): Promise<Layout[]> {
    return this.repo.find({
      where: { warehouseId },
      order: { updatedAt: 'DESC' },
    })
  }

  async findOne(id: number): Promise<Layout> {
    const layout = await this.repo.findOne({ where: { id } })
    if (!layout) throw new NotFoundException(`Layout #${id} not found`)
    return layout
  }

  async save(dto: SaveLayoutDto): Promise<Layout> {
    // 同名があれば上書き、なければ新規
    let layout = await this.repo.findOne({
      where: { warehouseId: dto.warehouseId, name: dto.name },
    })

    if (!layout) {
      layout = this.repo.create({ warehouseId: dto.warehouseId })
    }

    layout.name        = dto.name
    layout.objectsJson = dto.objects
    layout.isActive    = dto.isActive ?? false

    // バージョンインクリメント
    layout.version = (layout.version ?? 0) + 1

    return this.repo.save(layout)
  }

  async remove(id: number): Promise<void> {
    const layout = await this.findOne(id)
    await this.repo.remove(layout)
  }
}
