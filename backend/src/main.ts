import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // CORS（フロントエンド localhost:5173 からのアクセスを許可）
  app.enableCors({ origin: ['http://localhost:5173', 'http://localhost:4173'] })

  // バリデーション
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  // API プレフィックス
  app.setGlobalPrefix('api')

  // Swagger UI
  const config = new DocumentBuilder()
    .setTitle('Warehouse API')
    .setDescription('3D倉庫システム REST API')
    .setVersion('1.0')
    .build()
  const doc = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, doc)

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`🚀 API Server: http://localhost:${port}/api`)
  console.log(`📘 Swagger:    http://localhost:${port}/api/docs`)
}
bootstrap()
