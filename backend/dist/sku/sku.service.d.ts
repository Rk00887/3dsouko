import { Repository } from 'typeorm';
import { Sku } from './sku.entity';
import { CreateSkuDto } from './sku.dto';
export declare class SkuService {
    private readonly repo;
    constructor(repo: Repository<Sku>);
    findAll(): Promise<Sku[]>;
    findOne(id: number): Promise<Sku>;
    create(dto: CreateSkuDto): Promise<Sku>;
    update(id: number, dto: Partial<CreateSkuDto>): Promise<Sku>;
    remove(id: number): Promise<void>;
    calculateCapacity(params: {
        skuQty: number;
        qtyPerCarton: number;
        palletCapacity: number;
        racksPerPallet: number;
        rackWidth: number;
        aisleWidth: number;
        warehouseDepth: number;
    }): {
        cartons: number;
        pallets: number;
        racks: number;
        rows: number;
        reqWidth: number;
        reqArea: number;
    };
}
