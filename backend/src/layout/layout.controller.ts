import { Controller, Get, Post, Delete, Param, Body,
         ParseIntPipe, HttpCode, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { LayoutService } from './layout.service'
import { SaveLayoutDto } from './layout.dto'

@ApiTags('layouts')
@Controller('layouts')
export class LayoutController {
  constructor(private readonly service: LayoutService) {}

  @Get()
  @ApiOperation({ summary: 'レイアウト一覧（倉庫IDで絞り込み）' })
  findAll(@Query('warehouseId', ParseIntPipe) warehouseId: number) {
    return this.service.findByWarehouse(warehouseId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'レイアウト詳細' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'レイアウト保存（upsert）' })
  save(@Body() dto: SaveLayoutDto) { return this.service.save(dto) }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'レイアウト削除' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id) }
}
