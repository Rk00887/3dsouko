import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './warehouse.dto';
export declare class WarehouseController {
    private readonly service;
    constructor(service: WarehouseService);
    findAll(): Promise<import("./warehouse.entity").Warehouse[]>;
    findOne(id: number): Promise<import("./warehouse.entity").Warehouse>;
    create(dto: CreateWarehouseDto): Promise<import("./warehouse.entity").Warehouse>;
    update(id: number, dto: UpdateWarehouseDto): Promise<import("./warehouse.entity").Warehouse>;
    remove(id: number): Promise<void>;
}
