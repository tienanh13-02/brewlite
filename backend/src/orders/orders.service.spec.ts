import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrdersService } from './orders.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: {
    order: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
  };
  const order = {
    id: 8,
    userId: 3,
    status: 'PAID',
    total: 35000,
    items: [],
    payment: { id: 4 },
  };

  beforeEach(() => {
    prisma = {
      order: {
        findMany: vi.fn().mockResolvedValue([order]),
        findUnique: vi.fn().mockResolvedValue(order),
      },
    };
    service = new OrdersService(prisma as unknown as PrismaService);
  });

  it('lists the user orders newest first', async () => {
    await expect(service.findByUser(3)).resolves.toEqual([order]);
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: { userId: 3 },
      include: { items: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns order details and payment for the owner', async () => {
    await expect(service.findOneForUser(8, 3)).resolves.toEqual(order);
    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { id: 8 },
      include: { items: true, payment: true },
    });
  });

  it('rejects access to another users order', async () => {
    await expect(service.findOneForUser(8, 9)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rejects an order that does not exist', async () => {
    prisma.order.findUnique.mockResolvedValue(null);
    await expect(service.findOneForUser(99, 3)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
