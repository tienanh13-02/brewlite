import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentsService } from './payments.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: {
    payment: { findUnique: ReturnType<typeof vi.fn> };
    order: { findUnique: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };

  const order = {
    id: 41,
    userId: 7,
    status: 'PENDING',
    total: 35000,
    payment: null,
  };
  const payment = {
    id: 12,
    orderId: 41,
    idempotencyKey: 'payment-key-41',
    amount: 35000,
    method: 'Ví',
    status: 'SUCCESS',
  };

  beforeEach(() => {
    prisma = {
      payment: { findUnique: vi.fn().mockResolvedValue(null) },
      order: { findUnique: vi.fn().mockResolvedValue(order) },
      $transaction: vi.fn(),
    };
    service = new PaymentsService(prisma as unknown as PrismaService);
  });

  afterEach(() => vi.restoreAllMocks());

  it('creates payment and marks the order PAID on success', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const tx = {
      payment: { create: vi.fn().mockResolvedValue(payment) },
      order: { update: vi.fn().mockResolvedValue({ ...order, status: 'PAID' }) },
    };
    prisma.$transaction.mockImplementation((callback) => callback(tx));

    const result = await service.process(
      { orderId: order.id, method: 'Ví' },
      order.userId,
      payment.idempotencyKey,
    );

    expect(result).toEqual(payment);
    expect(tx.payment.create).toHaveBeenCalledWith({
      data: {
        orderId: order.id,
        idempotencyKey: payment.idempotencyKey,
        amount: order.total,
        method: 'Ví',
        status: 'SUCCESS',
      },
    });
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: order.id },
      data: { status: 'PAID' },
    });
  });

  it('returns the existing payment for an owned order retry', async () => {
    prisma.order.findUnique.mockResolvedValue({ ...order, status: 'PAID' });
    prisma.payment.findUnique.mockResolvedValue(payment);

    await expect(
      service.process(
        { orderId: order.id, method: 'Ví' },
        order.userId,
        payment.idempotencyKey,
      ),
    ).resolves.toEqual(payment);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('checks order ownership before looking up the idempotency key', async () => {
    prisma.order.findUnique.mockResolvedValue({ ...order, userId: 99 });

    await expect(
      service.process(
        { orderId: order.id, method: 'Ví' },
        order.userId,
        payment.idempotencyKey,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.payment.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a reused key for a different order', async () => {
    prisma.payment.findUnique.mockResolvedValue({ ...payment, orderId: 42 });

    await expect(
      service.process(
        { orderId: order.id, method: 'Ví' },
        order.userId,
        payment.idempotencyKey,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects a missing order', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(
      service.process(
        { orderId: order.id, method: 'Ví' },
        order.userId,
        payment.idempotencyKey,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
