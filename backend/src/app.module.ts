import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { databaseConfig } from './config/database.config'
import { WarehouseModule } from './warehouse/warehouse.module'
import { LayoutModule } from './layout/layout.module'
import { SkuModule } from './sku/sku.module'
import { InventoryModule } from './inventory/inventory.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: databaseConfig }),
    WarehouseModule,
    LayoutModule,
    SkuModule,
    InventoryModule,
  ],
})
export class AppModule {}
