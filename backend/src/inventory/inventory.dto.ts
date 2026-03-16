import { IsNumber, IsOptional, IsString, Min, IsObject, IsDateString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateInventoryDto {
  @ApiProperty()
  @IsNumber()
  warehouseId: number

  @ApiProperty()
  @IsNumber()
  skuId: number

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  quantity: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  location?: { aisle?: string; rack?: number; level?: number; slot?: number; x?: number; z?: number }

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lotNumber?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string

  @ApiPropertyOptional({ enum: ['stored', 'reserved', 'picking'] })
  @IsOptional()
  @IsString()
  status?: string
}

export class UpdateInventoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  location?: object

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string
}

export class StockMoveDto {
  @ApiProperty()
  @IsNumber()
  inventoryId: number

  @ApiProperty()
  @IsNumber()
  quantity: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  toLocation?: object
}
