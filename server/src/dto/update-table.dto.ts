/* eslint-disable prettier/prettier */
// src/dto/update-table.dto.ts
import { IsOptional, IsInt, Min } from 'class-validator';

export class UpdateTableDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  tableNumber?: number; // Table number can be updated if needed
}
