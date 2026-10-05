import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: {
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    productsService = {
      findAll: vi.fn(),
      findOne: vi.fn().mockResolvedValue({ id: 1 }),
    };
    controller = new ProductsController(
      productsService as unknown as ProductsService,
    );
  });

  it('forwards product-list requests to the service', () => {
    controller.getAll();
    expect(productsService.findAll).toHaveBeenCalledOnce();
  });

  it('forwards product ids to the service', () => {
    controller.getOne(1);
    expect(productsService.findOne).toHaveBeenCalledWith(1);
  });
});
