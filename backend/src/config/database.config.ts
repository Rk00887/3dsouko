import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type:        'postgres',
  host:         process.env.DB_HOST     || 'localhost',
  port:         parseInt(process.env.DB_PORT || '5432'),
  username:     process.env.DB_USER     || 'postgres',
  password:     process.env.DB_PASSWORD || 'password',
  database:     process.env.DB_NAME     || 'warehouse_db',
  autoLoadEntities: true,
  synchronize:  process.env.NODE_ENV === 'development',  // 本番ではfalse
  logging:      process.env.NODE_ENV === 'development',
})
