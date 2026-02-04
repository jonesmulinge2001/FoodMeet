/* eslint-disable prettier/prettier */
import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID()
  menuItemId: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}
