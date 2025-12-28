import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

import { AppModule } from './app.module';

const config = new DocumentBuilder()
  .setTitle('With-NestJs API')
  .setDescription('With-NestJs API description')
  .setVersion('1.0')
  .addTag('With-NestJs')
  .build();

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    app.use(
      '/reference',
      apiReference({
        content: document,
      }),
    );

    app.enableCors({
      origin: 'http://localhost:3001',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    });

    const port = process.env.PORT || 3000;
    const host = '0.0.0.0'; // Explicitly bind to all interfaces for Railway
    await app.listen(port, host);
    console.log(`Application is running on: http://0.0.0.0:${port}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

void bootstrap();
