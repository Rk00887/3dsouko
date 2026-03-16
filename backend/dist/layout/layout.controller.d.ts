import { LayoutService } from './layout.service';
import { SaveLayoutDto } from './layout.dto';
export declare class LayoutController {
    private readonly service;
    constructor(service: LayoutService);
    findAll(warehouseId: number): Promise<import("./layout.entity").Layout[]>;
    findOne(id: number): Promise<import("./layout.entity").Layout>;
    save(dto: SaveLayoutDto): Promise<import("./layout.entity").Layout>;
    remove(id: number): Promise<void>;
}
