import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: { process: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    paymentsService = { process: vi.fn().mockResolvedValue({ id: 1 }) };
    controller = new PaymentsController(
      paymentsService as unknown as PaymentsService,
    );
  });

  it('requires an idempotency key', () => {
    expect(() =>
      controller.process(
        { orderId: 1, method: 'Ví' },
        { user: { userId: 7 } },
      ),
    ).toThrow(BadRequestException);
    expect(paymentsService.process).not.toHaveBeenCalled();
  });

  it('requires an idempotency key at least eight characters long', () => {
    expect(() =>
      controller.process(
        { orderId: 1, method: 'Ví' },
        { user: { userId: 7 } },
        'short',
      ),
    ).toThrow(BadRequestException);
    expect(paymentsService.process).not.toHaveBeenCalled();
  });

  it('passes payment data and authenticated user to the service', () => {
    const dto = { orderId: 1, method: 'Ví' };
    controller.process(dto, { user: { userId: 7 } }, 'payment-key-1');
    expect(paymentsService.process).toHaveBeenCalledWith(
      dto,
      7,
      'payment-key-1',
    );
  });
});
