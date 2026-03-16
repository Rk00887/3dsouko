import { Repository } from 'typeorm';
import { Layout } from './layout.entity';
import { SaveLayoutDto } from './layout.dto';
export declare class LayoutService {
    private readonly repo;
    constructor(repo: Repository<Layout>);
    findByWarehouse(warehouseId: number): Promise<Layout[]>;
    findOne(id: number): Promise<Layout>;
    save(dto: SaveLayoutDto): Promise<Layout>;
    remove(id: number): Promise<void>;
}
