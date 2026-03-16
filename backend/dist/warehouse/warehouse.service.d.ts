import { Repository } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { CreateWarehouseDto, UpdateWarehouseDto } from './warehouse.dto';
export declare class WarehouseService {
    private readonly repo;
    constructor(repo: Repository<Warehouse>);
    findAll(): Promise<Warehouse[]>;
    findOne(id: number): Promise<Warehouse>;
    create(dto: CreateWarehouseDto): Promise<Warehouse>;
    update(id: number, dto: UpdateWarehouseDto): Promise<Warehouse>;
    remove(id: number): Promise<void>;
}
