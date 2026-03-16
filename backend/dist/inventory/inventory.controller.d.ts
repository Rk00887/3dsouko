import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto, StockMoveDto } from './inventory.dto';
export declare class InventoryController {
    private readonly service;
    constructor(service: InventoryService);
    findAll(warehouseId: number): Promise<import("./inventory.entity").Inventory[]>;
    summary(warehouseId: number): Promise<{
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
    findOne(id: number): Promise<import("./inventory.entity").Inventory>;
    create(dto: CreateInventoryDto): Promise<import("./inventory.entity").Inventory>;
    update(id: number, dto: UpdateInventoryDto): Promise<import("./inventory.entity").Inventory>;
    remove(id: number): Promise<void>;
    inbound(body: {
        warehouseId: number;
        skuId: number;
        quantity: number;
        location?: object;
        lotNumber?: string;
        expiresAt?: string;
        minStock?: number;
    }): Promise<import("./inventory.entity").Inventory>;
    outbound(id: number, body: {
        quantity: number;
    }): Promise<import("./inventory.entity").Inventory>;
    move(dto: StockMoveDto): Promise<import("./inventory.entity").Inventory>;
}
