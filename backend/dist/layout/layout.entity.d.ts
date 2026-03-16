import { Warehouse } from '../warehouse/warehouse.entity';
export declare class Layout {
    id: number;
    warehouse: Warehouse;
    warehouseId: number;
    name: string;
    version: number;
    isActive: boolean;
    objectsJson: object;
    createdAt: Date;
    updatedAt: Date;
}
