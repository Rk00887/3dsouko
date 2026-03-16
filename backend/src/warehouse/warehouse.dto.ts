import { IsString, IsNumber, IsOptional, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Tokyo Warehouse' })
  @IsString()
  name: string

  @ApiProperty({ example: 80 })
  @IsNumber()
  @Min(1)
  width: number

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(1)
  length: number

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  height: number

  @ApiPropertyOptional({ example: 'concrete' })
  @IsOptional()
  @IsString()
  floorType?: string
}

export class UpdateWarehouseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  width?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  length?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  height?: number
}
