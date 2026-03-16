import { Controller, Get, Post, Put, Delete, Param, Body,
         ParseIntPipe, HttpCode } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { WarehouseService } from './warehouse.service'
import { CreateWarehouseDto, UpdateWarehouseDto } from './warehouse.dto'

@ApiTags('warehouses')
@Controller('warehouses')
export class WarehouseController {
  constructor(private readonly service: WarehouseService) {}

  @Get()
  @ApiOperation({ summary: '倉庫一覧' })
  findAll() { return this.service.findAll() }

  @Get(':id')
  @ApiOperation({ summary: '倉庫詳細' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id) }

  @Post()
  @ApiOperation({ summary: '倉庫作成' })
  create(@Body() dto: CreateWarehouseDto) { return this.service.create(dto) }

  @Put(':id')
  @ApiOperation({ summary: '倉庫更新' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWarehouseDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: '倉庫削除' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id) }
}
