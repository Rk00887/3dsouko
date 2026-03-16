import { Controller, Get, Post, Put, Delete, Patch,
         Param, Body, Query, ParseIntPipe, HttpCode } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { InventoryService } from './inventory.service'
import { CreateInventoryDto, UpdateInventoryDto, StockMoveDto } from './inventory.dto'

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get()
  @ApiOperation({ summary: '在庫一覧（倉庫IDで絞り込み）' })
  findAll(@Query('warehouseId', ParseIntPipe) warehouseId: number) {
    return this.service.findByWarehouse(warehouseId)
  }

  @Get('summary')
  @ApiOperation({ summary: '在庫サマリー' })
  summary(@Query('warehouseId', ParseIntPipe) warehouseId: number) {
    return this.service.getSummary(warehouseId)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: '在庫登録' })
  create(@Body() dto: CreateInventoryDto) { return this.service.create(dto) }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInventoryDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id) }

  @Post('inbound')
  @ApiOperation({ summary: '入荷処理' })
  inbound(@Body() body: {
    warehouseId: number
    skuId: number
    quantity: number
    location?: object
    lotNumber?: string
    expiresAt?: string
    minStock?: number
  }) {
    return this.service.inbound(body)
  }

  @Post(':id/outbound')
  @ApiOperation({ summary: '出荷処理' })
  outbound(@Param('id', ParseIntPipe) id: number, @Body() body: { quantity: number }) {
    return this.service.outbound(id, body.quantity)
  }

  @Patch('move')
  @ApiOperation({ summary: '倉庫内移動' })
  move(@Body() dto: StockMoveDto) { return this.service.move(dto) }
}
