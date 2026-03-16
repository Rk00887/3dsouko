import { Controller, Get, Post, Put, Delete, Param,
         Body, ParseIntPipe, HttpCode } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { SkuService } from './sku.service'
import { CreateSkuDto } from './sku.dto'

@ApiTags('skus')
@Controller('skus')
export class SkuController {
  constructor(private readonly service: SkuService) {}

  @Get()
  @ApiOperation({ summary: 'SKU一覧' })
  findAll() { return this.service.findAll() }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id) }

  @Post()
  create(@Body() dto: CreateSkuDto) { return this.service.create(dto) }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateSkuDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id) }

  @Post('calculate')
  @ApiOperation({ summary: 'SKU容量計算' })
  calculate(@Body() params: any) { return this.service.calculateCapacity(params) }
}
