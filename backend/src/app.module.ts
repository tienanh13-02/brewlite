import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProductsModule } from './products/products.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const jwtSecret =
          typeof config.JWT_SECRET === 'string'
            ? config.JWT_SECRET.trim()
            : '';
        const normalizedSecret = jwtSecret.toLowerCase();
        if (
          jwtSecret.length < 32 ||
          normalizedSecret === 'dev-secret' ||
          normalizedSecret === 'dien_chuoi_secret_cua_ban_vao_day'
        ) {
          throw new Error(
            'JWT_SECRET must be configured with a non-placeholder value of at least 32 characters',
          );
        }

        return { ...config, JWT_SECRET: jwtSecret };
      },
    }),
    PrismaModule,     // ← Thêm
    ProductsModule,
    OrdersModule,
    AuthModule,     // ← Sẽ tạo ở phần H
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
