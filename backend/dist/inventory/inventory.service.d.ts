import { Repository } from 'typeorm';
import { Inventory } from './inventory.entity';
import { CreateInventoryDto, UpdateInventoryDto, StockMoveDto } from './inventory.dto';
export declare class InventoryService {
    private readonly repo;
    constructor(repo: Repository<Inventory>);
    findByWarehouse(warehouseId: number): Promise<Inventory[]>;
    findOne(id: number): Promise<Inventory>;
    create(dto: CreateInventoryDto): Promise<Inventory>;
    update(id: number, dto: UpdateInventoryDto): Promise<Inventory>;
    remove(id: number): Promise<void>;
    inbound(body: {
        warehouseId: number;
        skuId: number;
        quantity: number;
        location?: object;
        lotNumber?: string;
        expiresAt?: string;
        minStock?: number;
    }): Promise<Inventory>;
    outbound(id: number, quantity: number): Promise<Inventory>;
    move(dto: StockMoveDto): Promise<Inventory>;
    getSummary(warehouseId: number): Promise<{
        totalItems: number;
        totalQuantity: number;
        lowStockCount: number;
        byRank: {
            A: number;
            B: number;
            C: number;
            unknown: number;
        };
    }>;
}
