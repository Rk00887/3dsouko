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
exports.SaveLayoutDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SaveLayoutDto {
    warehouseId;
    name;
    objects;
    isActive;
}
exports.SaveLayoutDto = SaveLayoutDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaveLayoutDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Layout v1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveLayoutDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '3Dオブジェクト配列', type: 'array' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], SaveLayoutDto.prototype, "objects", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaveLayoutDto.prototype, "isActive", void 0);
//# sourceMappingURL=layout.dto.js.map