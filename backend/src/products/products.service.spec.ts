import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductsService } from './products.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: {
    product: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
  };
  const product = { id: 1, name: 'Coffee', price: 35000 };

  beforeEach(() => {
    prisma = {
      product: {
        findMany: vi.fn().mockResolvedValue([product]),
        findUnique: vi.fn().mockResolvedValue(product),
      },
    };
    service = new ProductsService(prisma as unknown as PrismaService);
  });

  it('lists products in ascending id order', async () => {
    await expect(service.findAll()).resolves.toEqual([product]);
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      orderBy: { id: 'asc' },
    });
  });

  it('finds a product by id', async () => {
    await expect(service.findOne(1)).resolves.toEqual(product);
    expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('throws when a product does not exist', async () => {
    prisma.product.findUnique.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
