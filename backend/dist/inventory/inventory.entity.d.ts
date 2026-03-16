import { Sku } from '../sku/sku.entity';
export declare class Inventory {
    id: number;
    warehouseId: number;
    sku: Sku;
    skuId: number;
    location: {
        aisle?: string;
        rack?: number;
        level?: number;
        slot?: number;
        x?: number;
        z?: number;
    };
    quantity: number;
    minStock: number;
    lotNumber: string;
    expiresAt: Date;
    status: string;
    updatedAt: Date;
    createdAt: Date;
}
