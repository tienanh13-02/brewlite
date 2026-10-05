import { IsIn, IsInt, Min } from 'class-validator';

export class ProcessPaymentDto {
  @IsInt()
  @Min(1)
  orderId: number;

  @IsIn(['Ví', 'Thẻ'], {
    message: 'Phương thức thanh toán phải là "Ví" hoặc "Thẻ"',
  })
  method: string;
}