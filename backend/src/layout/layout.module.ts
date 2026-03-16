import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Layout } from './layout.entity'
import { LayoutService } from './layout.service'
import { LayoutController } from './layout.controller'

@Module({
  imports:     [TypeOrmModule.forFeature([Layout])],
  providers:   [LayoutService],
  controllers: [LayoutController],
  exports:     [LayoutService],
})
export class LayoutModule {}
