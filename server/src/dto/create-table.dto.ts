/* eslint-disable prettier/prettier */
import { IsInt, IsPositive } from 'class-validator';

export class createTableDto {

  @IsInt()
  @IsPositive()
  tableNumber: number;

  @IsInt()
  @IsPositive()
  seatsCount: number;
}
