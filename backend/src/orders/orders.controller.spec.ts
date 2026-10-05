import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: {
    create: ReturnType<typeof vi.fn>;
    findByUser: ReturnType<typeof vi.fn>;
    findOneForUser: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    ordersService = {
      create: vi.fn(),
      findByUser: vi.fn(),
      findOneForUser: vi.fn(),
    };
    controller = new OrdersController(ordersService as unknown as OrdersService);
  });

  it('creates an order for the authenticated user', () => {
    const dto = { items: [] };
    controller.create(dto, { user: { userId: 3 } });
    expect(ordersService.create).toHaveBeenCalledWith(dto, 3);
  });

  it('lists orders for the authenticated user', () => {
    controller.getMyOrders({ user: { userId: 3 } });
    expect(ordersService.findByUser).toHaveBeenCalledWith(3);
  });

  it('requests one order scoped to the authenticated user', () => {
    controller.getOrder(8, { user: { userId: 3 } });
    expect(ordersService.findOneForUser).toHaveBeenCalledWith(8, 3);
  });
});
