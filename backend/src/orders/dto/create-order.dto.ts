import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsString,
  Min,
  ValidateNested,
  ArrayMinSize,
  IsIn,
} from 'class-validator';

export class OrderItemDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsString()
  @IsIn(['S', 'M', 'L'])
  size: string;

  @IsString()
  topping: string;

  @IsInt()
  @Min(1)
  qty: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}