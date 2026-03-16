import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Sku } from './sku.entity'
import { SkuService } from './sku.service'
import { SkuController } from './sku.controller'

@Module({
  imports:     [TypeOrmModule.forFeature([Sku])],
  providers:   [SkuService],
  controllers: [SkuController],
  exports:     [SkuService],
})
export class SkuModule {}
