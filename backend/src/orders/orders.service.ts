import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

const SIZE_EXTRA: Record<string, number> = {
  S: 0,
  M: 0,
  L: 5000,
};

const TOPPING_EXTRA: Record<string, number> = {
  'Không': 0,
  'Trân châu': 5000,
  'Kem': 7000,
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId?: number) {
    // 1. Lấy tất cả sản phẩm liên quan
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // 2. Kiểm tra sản phẩm tồn tại
    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new BadRequestException(
          `Sản phẩm có id ${item.productId} không tồn tại`
        );
      }
    }

    // 3. Tính tổng tiền
    let total = 0;
    const orderItems = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const unitPrice =
        product.price + SIZE_EXTRA[item.size] + TOPPING_EXTRA[item.topping];
      const lineTotal = unitPrice * item.qty;
      total += lineTotal;

      return {
        productId: item.productId,
        size: item.size,
        topping: item.topping,
        qty: item.qty,
        lineTotal,
      };
    });

    // 4. Tạo Order + OrderItem trong transaction
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: userId ?? null,
          status: 'PENDING',
          total,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      return order;
    });
  }
}