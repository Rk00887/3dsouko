import { Layout } from '../layout/layout.entity';
export declare class Warehouse {
    id: number;
    name: string;
    width: number;
    length: number;
    height: number;
    floorType: string;
    layouts: Layout[];
    createdAt: Date;
    updatedAt: Date;
}
