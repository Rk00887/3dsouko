"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inventory_entity_1 = require("./inventory.entity");
let InventoryService = class InventoryService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    findByWarehouse(warehouseId) {
        return this.repo.find({
            where: { warehouseId },
            relations: ['sku'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const inv = await this.repo.findOne({ where: { id }, relations: ['sku'] });
        if (!inv)
            throw new common_1.NotFoundException(`Inventory #${id} not found`);
        return inv;
    }
    create(dto) {
        return this.repo.save(this.repo.create(dto));
    }
    async update(id, dto) {
        const inv = await this.findOne(id);
        Object.assign(inv, dto);
        return this.repo.save(inv);
    }
    async remove(id) {
        const inv = await this.findOne(id);
        await this.repo.remove(inv);
    }
    async inbound(body) {
        const { warehouseId, skuId, quantity, location, lotNumber, expiresAt, minStock } = body;
        let inv = await this.repo.findOne({ where: { warehouseId, skuId, lotNumber: lotNumber || null } });
        if (inv) {
            inv.quantity += quantity;
            if (location)
                inv.location = location;
        }
        else {
            inv = this.repo.create({
                warehouseId, skuId, quantity,
                location: location,
                lotNumber,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                minStock: minStock ?? 0,
            });
        }
        return this.repo.save(inv);
    }
    async outbound(id, quantity) {
        const inv = await this.findOne(id);
        if (inv.quantity < quantity) {
            throw new common_1.BadRequestException(`在庫不足: 要求 ${quantity}, 在庫 ${inv.quantity}`);
        }
        inv.quantity -= quantity;
        return this.repo.save(inv);
    }
    async move(dto) {
        const inv = await this.findOne(dto.inventoryId);
        if (dto.toLocation)
            inv.location = dto.toLocation;
        return this.repo.save(inv);
    }
    async getSummary(warehouseId) {
        const items = await this.findByWarehouse(warehouseId);
        const totalItems = items.length;
        const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
        const lowStockCount = items.filter(i => i.quantity <= i.minStock).length;
        const byRank = { A: 0, B: 0, C: 0, unknown: 0 };
        items.forEach(i => {
            const rank = i.sku?.abcRank || 'unknown';
            byRank[rank] = (byRank[rank] || 0) + i.quantity;
        });
        return { totalItems, totalQuantity, lowStockCount, byRank };
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventory_entity_1.Inventory)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map