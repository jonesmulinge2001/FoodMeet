/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Get, // Add Get decorator
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { createTableDto } from '../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';
import { JwtAuthGuard } from '../guards/jwt/jwtauth.guard';
import { AddSeatDto } from '../dto/add-seat.dto';

@Controller('tables') // Changed from 'restaurants' to 'tables'
export class TablesController { // Rename to TablesController
  constructor(private readonly restaurantsService: RestaurantsService) {}

  // ================================
  // GET ALL TABLES
  // ================================
  @Get()
  async getTables() {
    // You need to add this method to your service
    return this.restaurantsService.getTables();
  }

  // ================================
  // CREATE TABLE (without restaurantId)
  // ================================
  @Post()
  @UseGuards(JwtAuthGuard)
  async addTable(@Body() dto: createTableDto) {
    return this.restaurantsService.addTable(dto);
  }

  // ================================
  // UPDATE TABLE
  // ================================
  @Patch(':tableId')
  @UseGuards(JwtAuthGuard)
  async updateTable(
    @Param('tableId') tableId: string,
    @Body() dto: UpdateTableDto,
  ) {
    return this.restaurantsService.updateTable(tableId, dto);
  }

  // ================================
  // DELETE TABLE
  // ================================
  @Delete(':tableId')
  @UseGuards(JwtAuthGuard)
  async deleteTable(@Param('tableId') tableId: string) {
    return this.restaurantsService.deleteTable(tableId);
  }

  // ================================
  // SEAT CRUD
  // ================================

  @Post(':tableId/seats')
  @UseGuards(JwtAuthGuard)
  async addSeat(
    @Param('tableId') tableId: string,
    @Body() dto: AddSeatDto,
  ) {
    return this.restaurantsService.addSeatToTable(tableId, dto.seatNumber);
  }
  
  @Delete('seats/:seatId')
  @UseGuards(JwtAuthGuard)
  async deleteSeat(@Param('seatId') seatId: string) {
    return this.restaurantsService.deleteSeat(seatId);
  }
}