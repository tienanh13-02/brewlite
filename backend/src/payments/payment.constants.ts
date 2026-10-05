// Trạng thái Payment
export const PAYMENT_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const;

// Trạng thái Order liên quan đến payment
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
} as const;

// Tỉ lệ thành công của mock (0.9 = 90%)
export const MOCK_SUCCESS_RATE = 0.9;