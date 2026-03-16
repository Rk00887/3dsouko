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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sku = void 0;
const typeorm_1 = require("typeorm");
let Sku = class Sku {
    id;
    skuCode;
    name;
    category;
    abcRank;
    length;
    width;
    height;
    weight;
    boxQty;
    isActive;
    createdAt;
    updatedAt;
};
exports.Sku = Sku;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Sku.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    __metadata("design:type", String)
], Sku.prototype, "skuCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 300 }),
    __metadata("design:type", String)
], Sku.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Sku.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'char', length: 1, nullable: true }),
    __metadata("design:type", String)
], Sku.prototype, "abcRank", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 8, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], Sku.prototype, "length", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 8, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], Sku.prototype, "width", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 8, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], Sku.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 8, scale: 3, nullable: true }),
    __metadata("design:type", Number)
], Sku.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Sku.prototype, "boxQty", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Sku.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Sku.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Sku.prototype, "updatedAt", void 0);
exports.Sku = Sku = __decorate([
    (0, typeorm_1.Entity)()
], Sku);
//# sourceMappingURL=sku.entity.js.map