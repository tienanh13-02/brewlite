import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProcessPaymentDto } from './dto/process-payment.dto.js';
import {
  PAYMENT_STATUS,
  ORDER_STATUS,
  MOCK_SUCCESS_RATE,
} from './payment.constants.js';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async process(
    dto: ProcessPaymentDto,
    userId: number,
    idempotencyKey: string,
  ) {
    // Check order ownership before revealing any payment by idempotency key.
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException(`Đơn hàng #${dto.orderId} không tồn tại`);
    }

    // 2.1. Order phải thuộc về user đang đăng nhập
    if (order.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền thanh toán đơn này');
    }

    const existingPayment = await this.prisma.payment.findUnique({
      where: { idempotencyKey },
    });

    if (existingPayment) {
      if (existingPayment.orderId !== dto.orderId) {
        throw new ConflictException(
          'Idempotency-Key đã được sử dụng cho yêu cầu khác',
        );
      }

      console.log(
        `♻️  Idempotency hit: key=${idempotencyKey}, paymentId=${existingPayment.id}`
      );
      return existingPayment;
    }

    // 2.2. Order phải ở trạng thái PENDING
    if (order.status !== ORDER_STATUS.PENDING) {
      throw new BadRequestException(
        `Đơn hàng đang ở trạng thái "${order.status}", không thể thanh toán`
      );
    }

    // 2.3. Order chưa có payment (unique constraint đã đảm bảo, nhưng check trước cho rõ ràng)
    if (order.payment) {
      throw new ConflictException('Đơn hàng đã được thanh toán');
    }

    // ========================================
    // BƯỚC 3: Mock xử lý thanh toán
    // ========================================
    const success = Math.random() < MOCK_SUCCESS_RATE;

    const paymentStatus = success
      ? PAYMENT_STATUS.SUCCESS
      : PAYMENT_STATUS.FAILED;

    const newOrderStatus = success
      ? ORDER_STATUS.PAID
      : ORDER_STATUS.PAYMENT_FAILED;

    console.log(
      `💳 Xử lý payment: orderId=${dto.orderId}, method=${dto.method}, ` +
        `result=${paymentStatus}`
    );

    // ========================================
    // BƯỚC 4: Transaction — tạo Payment + update Order
    // ========================================
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 4.1. Tạo Payment
        const payment = await tx.payment.create({
          data: {
            orderId: dto.orderId,
            idempotencyKey,
            amount: order.total,
            method: dto.method,
            status: paymentStatus,
          },
        });

        // 4.2. Cập nhật Order status
        await tx.order.update({
          where: { id: dto.orderId },
          data: { status: newOrderStatus },
        });

        return payment;
      });
    } catch (error: any) {
      // Xử lý race condition: 2 request cùng idempotencyKey
      if (error.code === 'P2002') {
        // Unique constraint failed
        console.log(
          `⚠️  Race condition: 2 request cùng idempotencyKey=${idempotencyKey}`
        );
        const racedPayment = await this.prisma.payment.findUnique({
          where: { idempotencyKey },
        });
        if (racedPayment?.orderId === dto.orderId) {
          return racedPayment;
        }
        if (racedPayment) {
          throw new ConflictException(
            'Idempotency-Key đã được sử dụng cho yêu cầu khác',
          );
        }
      }
      throw error;
    }
  }
}