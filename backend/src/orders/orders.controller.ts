import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    // Tạm thời chưa có auth, userId = null
    return this.ordersService.create(dto, undefined);
  }
}