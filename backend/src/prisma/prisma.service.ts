import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Kết nối PostgreSQL thành công');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Đã ngắt kết nối PostgreSQL');
  }
}