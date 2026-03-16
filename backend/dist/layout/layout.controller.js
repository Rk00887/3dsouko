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
exports.LayoutController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const layout_service_1 = require("./layout.service");
const layout_dto_1 = require("./layout.dto");
let LayoutController = class LayoutController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(warehouseId) {
        return this.service.findByWarehouse(warehouseId);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    save(dto) { return this.service.save(dto); }
    remove(id) { return this.service.remove(id); }
};
exports.LayoutController = LayoutController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'レイアウト一覧（倉庫IDで絞り込み）' }),
    __param(0, (0, common_1.Query)('warehouseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LayoutController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'レイアウト詳細' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LayoutController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'レイアウト保存（upsert）' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [layout_dto_1.SaveLayoutDto]),
    __metadata("design:returntype", void 0)
], LayoutController.prototype, "save", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    (0, swagger_1.ApiOperation)({ summary: 'レイアウト削除' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LayoutController.prototype, "remove", null);
exports.LayoutController = LayoutController = __decorate([
    (0, swagger_1.ApiTags)('layouts'),
    (0, common_1.Controller)('layouts'),
    __metadata("design:paramtypes", [layout_service_1.LayoutService])
], LayoutController);
//# sourceMappingURL=layout.controller.js.map