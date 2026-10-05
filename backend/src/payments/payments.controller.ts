import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { ProcessPaymentDto } from './dto/process-payment.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  process(
    @Body() dto: ProcessPaymentDto,
    @Req() req: any,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    // Idempotency-Key là bắt buộc
    if (!idempotencyKey) {
      throw new BadRequestException(
        'Header "Idempotency-Key" là bắt buộc'
      );
    }

    // Độ dài tối thiểu để tránh key quá ngắn
    if (idempotencyKey.length < 8) {
      throw new BadRequestException(
        'Idempotency-Key phải có ít nhất 8 ký tự'
      );
    }

    return this.paymentsService.process(
      dto,
      req.user.userId,
      idempotencyKey,
    );
  }
}