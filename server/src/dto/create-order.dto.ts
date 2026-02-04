/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
import {
  IsEnum,
  IsInt,
  IsString,
  ValidateIf,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';
import { OrderType } from 'generated/prisma/enums';

export class CreateOrderDto {
  @IsEnum(OrderType)
  orderType: OrderType;

  // DINE_IN only
  @ValidateIf((o) => o.orderType === OrderType.DINE_IN)
  @IsInt()
  tableNumber?: number;

  @ValidateIf((o) => o.orderType === OrderType.DINE_IN)
  @IsInt()
  seatNumber?: number;

  // DELIVERY only
  @ValidateIf((o) => o.orderType === OrderType.DELIVERY)
  @IsString()
  deliveryAddress?: string;

  @ValidateIf((o) => o.orderType === OrderType.DELIVERY)
  @IsString()
  deliveryPhone?: string;

  @IsArray()
  @ArrayMinSize(1)
  items: CreateOrderItemDto[];
}
