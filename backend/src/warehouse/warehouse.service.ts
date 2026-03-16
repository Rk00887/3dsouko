import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Warehouse } from './warehouse.entity'
import { CreateWarehouseDto, UpdateWarehouseDto } from './warehouse.dto'

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly repo: Repository<Warehouse>,
  ) {}

  findAll(): Promise<Warehouse[]> {
    return this.repo.find({ relations: ['layouts'], order: { createdAt: 'DESC' } })
  }

  async findOne(id: number): Promise<Warehouse> {
    const wh = await this.repo.findOne({ where: { id }, relations: ['layouts'] })
    if (!wh) throw new NotFoundException(`Warehouse #${id} not found`)
    return wh
  }

  create(dto: CreateWarehouseDto): Promise<Warehouse> {
    const wh = this.repo.create(dto)
    return this.repo.save(wh)
  }

  async update(id: number, dto: UpdateWarehouseDto): Promise<Warehouse> {
    const wh = await this.findOne(id)
    Object.assign(wh, dto)
    return this.repo.save(wh)
  }

  async remove(id: number): Promise<void> {
    const wh = await this.findOne(id)
    await this.repo.remove(wh)
  }
}
