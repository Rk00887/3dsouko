import { IsString, IsNumber, IsBoolean, IsOptional, Min, IsIn } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateSkuDto {
  @ApiProperty({ example: 'ABC-001' })
  @IsString()
  skuCode: string

  @ApiProperty({ example: '商品名' })
  @IsString()
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string

  @ApiPropertyOptional({ enum: ['A', 'B', 'C'] })
  @IsOptional()
  @IsIn(['A', 'B', 'C'])
  abcRank?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  width?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  depth?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  height?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weight?: number

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  boxQty?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  stackable?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxStack?: number
}
