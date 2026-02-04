/* eslint-disable prettier/prettier */
import { IsInt, Min, IsNotEmpty } from 'class-validator';

export class AddSeatDto {
  @IsNotEmpty({ message: 'seatNumber is required' })
  @IsInt({ message: 'seatNumber must be an integer' })
  @Min(1, { message: 'seatNumber must be at least 1' })
  seatNumber: number;
}