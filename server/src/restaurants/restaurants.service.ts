/* eslint-disable prettier/prettier */
 
 
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { CreateRestaurantDto } from './../dto/create-restaurant.dto';
import { createTableDto } from './../dto/create-table.dto';
import { UpdateRestaurantDto } from 'src/dto/update-restaurant.dto';
import { UpdateTableDto } from 'src/dto/update-table.dto';

@Injectable()
export class RestaurantsService {
  private prisma = new PrismaClient();

  constructor() {}

  // -------------------------------
  // RESTAURANTS
  // -------------------------------
  async createRestaurant(ownerId: string, dto: CreateRestaurantDto) {
    return this.prisma.restaurant.create({
      data: { name: dto.name, location: dto.location, ownerId },
    });
  }

  async getRestaurants(ownerId: string) {
    return this.prisma.restaurant.findMany({
      where: { ownerId },
      include: { 
        tables: { include: { seats: true } }, 
        menuItems: true 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRestaurant(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { 
        tables: { include: { seats: true } }, 
        menuItems: true 
      },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }

  async updateRestaurant(restaurantId: string, dto: UpdateRestaurantDto) {
    await this.getRestaurant(restaurantId);
    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: { ...dto },
    });
  }

  async deleteRestaurant(restaurantId: string) {
    await this.getRestaurant(restaurantId);
    await this.prisma.table.deleteMany({
      where: { restaurantId },
    });
    await this.prisma.restaurant.delete({ where: { id: restaurantId } });
    return { success: true };
  }

  // -------------------------------
  // TABLES
  // -------------------------------
  async addTable(restaurantId: string, dto: createTableDto) {
    await this.getRestaurant(restaurantId);
    return this.prisma.table.create({ data: { tableNumber: dto.tableNumber, restaurantId } });
  }

  async updateTable(tableId: string, dto: UpdateTableDto) {
    const table = await this.prisma.table.findUnique({ where: { id: tableId } });
    if (!table) throw new NotFoundException('Table not found');
    return this.prisma.table.update({ where: { id: tableId }, data: { tableNumber: dto.tableNumber } });
  }

  async deleteTable(tableId: string) {
    const table = await this.prisma.table.findUnique({ where: { id: tableId } });
    if (!table) throw new NotFoundException('Table not found');
    await this.prisma.table.delete({ where: { id: tableId } });
    return { success: true };
  }

  // -------------------------------
  // SEATS (belongs to Table)
  // -------------------------------
  async addSeatToTable(tableId: string, seatNumber: number) {
    const table = await this.prisma.table.findUnique({ where: { id: tableId } });
    if (!table) throw new NotFoundException('Table not found');

    // Check if seat already exists for this table
    const existingSeat = await this.prisma.seat.findFirst({
      where: { tableId, seatNumber },
    });
    if (existingSeat) throw new BadRequestException('Seat number already exists for this table');

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
}
