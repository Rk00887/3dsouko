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
exports.LayoutService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const layout_entity_1 = require("./layout.entity");
let LayoutService = class LayoutService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    findByWarehouse(warehouseId) {
        return this.repo.find({
            where: { warehouseId },
            order: { updatedAt: 'DESC' },
        });
    }
    async findOne(id) {
        const layout = await this.repo.findOne({ where: { id } });
        if (!layout)
            throw new common_1.NotFoundException(`Layout #${id} not found`);
        return layout;
    }
    async save(dto) {
        let layout = await this.repo.findOne({
            where: { warehouseId: dto.warehouseId, name: dto.name },
        });
        if (!layout) {
            layout = this.repo.create({ warehouseId: dto.warehouseId });
        }
        layout.name = dto.name;
        layout.objectsJson = dto.objects;
        layout.isActive = dto.isActive ?? false;
        layout.version = (layout.version ?? 0) + 1;
        return this.repo.save(layout);
    }
    async remove(id) {
        const layout = await this.findOne(id);
        await this.repo.remove(layout);
    }
};
exports.LayoutService = LayoutService;
exports.LayoutService = LayoutService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(layout_entity_1.Layout)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LayoutService);
//# sourceMappingURL=layout.service.js.map