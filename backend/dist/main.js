"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({ origin: ['http://localhost:5173', 'http://localhost:4173'] });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Warehouse API')
        .setDescription('3D倉庫システム REST API')
        .setVersion('1.0')
        .build();
    const doc = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, doc);
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 API Server: http://localhost:${port}/api`);
    console.log(`📘 Swagger:    http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map