import { SkuService } from './sku.service';
import { CreateSkuDto } from './sku.dto';
export declare class SkuController {
    private readonly service;
    constructor(service: SkuService);
    findAll(): Promise<import("./sku.entity").Sku[]>;
    findOne(id: number): Promise<import("./sku.entity").Sku>;
    create(dto: CreateSkuDto): Promise<import("./sku.entity").Sku>;
    update(id: number, dto: CreateSkuDto): Promise<import("./sku.entity").Sku>;
    remove(id: number): Promise<void>;
    calculate(params: any): {
        cartons: number;
        pallets: number;
        racks: number;
        rows: number;
        reqWidth: number;
        reqArea: number;
    };
}
