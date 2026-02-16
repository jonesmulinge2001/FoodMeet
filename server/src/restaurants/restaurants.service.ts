/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { createTableDto } from './../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';

@Injectable()
export class RestaurantsService {
  private prisma = new PrismaClient();

  constructor() {}

  // -------------------------------
  // TABLES (without restaurantId)
  // -------------------------------
  async addTable(dto: createTableDto) { // Remove restaurantId parameter
    return this.prisma.table.create({
      data: { 
        tableNumber: dto.tableNumber, 
        // Remove restaurantId from here
      },
    });
  }

  async updateTable(tableId: string, dto: UpdateTableDto) {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });
    if (!table) throw new NotFoundException('Table not found');
    return this.prisma.table.update({
      where: { id: tableId },
      data: { tableNumber: dto.tableNumber },
    });
  }

  async deleteTable(tableId: string) {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });
    if (!table) throw new NotFoundException('Table not found');
    await this.prisma.table.delete({ where: { id: tableId } });
    return { success: true };
  }

  // -------------------------------
  // SEATS (belongs to Table)
  // -------------------------------
  async addSeatToTable(tableId: string, seatNumber: number) {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });
    if (!table) throw new NotFoundException('Table not found');

    // Check if seat already exists for this table
    const existingSeat = await this.prisma.seat.findFirst({
      where: { tableId, seatNumber },
    });
    if (existingSeat)
      throw new BadRequestException(
        'Seat number already exists for this table',
      );

    return this.prisma.seat.create({
      data: { seatNumber, tableId },
    });
  }

  async deleteSeat(seatId: string) {
    const seat = await this.prisma.seat.findUnique({ where: { id: seatId } });
    if (!seat) throw new NotFoundException('Seat not found');
    await this.prisma.seat.delete({ where: { id: seatId } });
    return { success: true };
  }

  // In your restaurants.service.ts, add this method:
async getTables() {
  return this.prisma.table.findMany({
    include: {
      seats: true,
    },
    orderBy: { tableNumber: 'asc' },
  });
}
}