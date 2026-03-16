import { IsString, IsNumber, IsOptional, IsBoolean, IsArray } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SaveLayoutDto {
  @ApiProperty()
  @IsNumber()
  warehouseId: number

  @ApiProperty({ example: 'Layout v1' })
  @IsString()
  name: string

  @ApiProperty({ description: '3Dオブジェクト配列', type: 'array' })
  @IsArray()
  objects: object[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
