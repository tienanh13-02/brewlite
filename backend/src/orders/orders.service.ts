import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async create(dto: CreateOrderDto, userId: number) {
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

    // 3. Kiểm tra size và topping
    for (const item of dto.items) {
      if (!(item.size in SIZE_EXTRA)) {
        throw new BadRequestException(`Size "${item.size}" không hợp lệ`);
      }
      if (!(item.topping in TOPPING_EXTRA)) {
        throw new BadRequestException(
          `Topping "${item.topping}" không hợp lệ`
        );
      }
    }

    // 4. Tính tổng tiền
    let total = 0;
    const orderItems = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const unitPrice =
        Number(product.price) +
        Number(SIZE_EXTRA[item.size]) +
        Number(TOPPING_EXTRA[item.topping]);
      

      const qty = Number(item.qty ?? 1);
      const lineTotal = unitPrice * qty;
      total += Number.isFinite(lineTotal) ? lineTotal : 0;

      return {
        productId: item.productId,
        size: item.size,
        topping: item.topping,
        qty,
        lineTotal,
      };
    });

    // 5. Tạo Order + OrderItem trong transaction
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          user: {
            connect: { id: userId },
          },
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

  async findByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true, payment: true },  // ← Thêm payment
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(orderId: number, userId: number) {
    const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, payment: true },
    });

    if (!order) {
        throw new NotFoundException(`Đơn hàng #${orderId} không tồn tại`);
    }

    if (order.userId !== userId) {
        throw new ForbiddenException('Bạn không có quyền xem đơn này');
    }

    return order;
    }
}
