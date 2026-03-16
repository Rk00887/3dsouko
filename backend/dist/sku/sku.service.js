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
exports.SkuService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sku_entity_1 = require("./sku.entity");
let SkuService = class SkuService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    findAll() {
        return this.repo.find({ order: { skuCode: 'ASC' } });
    }
    async findOne(id) {
        const sku = await this.repo.findOne({ where: { id } });
        if (!sku)
            throw new common_1.NotFoundException(`SKU #${id} not found`);
        return sku;
    }
    create(dto) {
        return this.repo.save(this.repo.create(dto));
    }
    async update(id, dto) {
        const sku = await this.findOne(id);
        Object.assign(sku, dto);
        return this.repo.save(sku);
    }
    async remove(id) {
        const sku = await this.findOne(id);
        await this.repo.remove(sku);
    }
    calculateCapacity(params) {
        const { skuQty, qtyPerCarton, palletCapacity, racksPerPallet, rackWidth, aisleWidth, warehouseDepth } = params;
        const cartons = Math.ceil(skuQty / qtyPerCarton);
        const pallets = Math.ceil(cartons / palletCapacity);
        const racks = Math.ceil(pallets / racksPerPallet);
        const rows = warehouseDepth
            ? Math.ceil(racks / Math.floor(warehouseDepth / 1.0))
            : racks;
        const reqWidth = rows * (rackWidth + aisleWidth);
        const reqArea = reqWidth * (warehouseDepth || 50);
        return { cartons, pallets, racks, rows, reqWidth, reqArea };
    }
};
exports.SkuService = SkuService;
exports.SkuService = SkuService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sku_entity_1.Sku)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SkuService);
//# sourceMappingURL=sku.service.js.map