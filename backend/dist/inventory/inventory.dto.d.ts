export declare class CreateInventoryDto {
    warehouseId: number;
    skuId: number;
    quantity: number;
    location?: {
        aisle?: string;
        rack?: number;
        level?: number;
        slot?: number;
        x?: number;
        z?: number;
    };
    minStock?: number;
    lotNumber?: string;
    expiresAt?: string;
    status?: string;
}
export declare class UpdateInventoryDto {
    quantity?: number;
    location?: object;
    status?: string;
}
export declare class StockMoveDto {
    inventoryId: number;
    quantity: number;
    toLocation?: object;
}
