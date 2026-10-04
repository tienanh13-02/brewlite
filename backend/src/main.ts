import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật validation toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,      // Loại bỏ field lạ
      forbidNonWhitelisted: true,  // Báo lỗi nếu có field lạ
      transform: true,      // Tự chuyển kiểu dữ liệu
    })
  );

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  await app.listen(3000);
  console.log('🚀 Backend running at http://localhost:3000');
}

bootstrap();