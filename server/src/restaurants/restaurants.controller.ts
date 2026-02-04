/* eslint-disable prettier/prettier */
 
 
/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from '../dto/create-restaurant.dto';
import { UpdateRestaurantDto } from '../dto/update-restaurant.dto';
import { createTableDto } from '../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';
import { RequestWithUser } from '../dto/requestWithUser';
import { JwtAuthGuard } from '../guards/jwt/jwtauth.guard';
import { AddSeatDto } from '../dto/add-seat.dto';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  // ================================
  // RESTAURANT CRUD
  // ================================

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRestaurant(
    @Body() dto: CreateRestaurantDto,
    @Req() req: RequestWithUser
  ) {
    return this.restaurantsService.createRestaurant(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getRestaurants(
    @Req() req: RequestWithUser
  ) {
    return this.restaurantsService.getRestaurants(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getRestaurant(@Param('id') restaurantId: string) {
    return this.restaurantsService.getRestaurant(restaurantId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateRestaurant(
    @Param('id') restaurantId: string,
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.updateRestaurant(restaurantId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteRestaurant(@Param('id') restaurantId: string) {
    return this.restaurantsService.deleteRestaurant(restaurantId);
  }

  // ================================
  // TABLE CRUD
  // ================================

  @Post(':restaurantId/tables')
  @UseGuards(JwtAuthGuard)
  async addTable(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: createTableDto,
  ) {
    return this.restaurantsService.addTable(restaurantId, dto);
  }

  @Patch('tables/:tableId')
  @UseGuards(JwtAuthGuard)
  async updateTable(
    @Param('tableId') tableId: string,
    @Body() dto: UpdateTableDto,
  ) {
    return this.restaurantsService.updateTable(tableId, dto);
  }

  @Delete('tables/:tableId')
  @UseGuards(JwtAuthGuard)
  async deleteTable(@Param('tableId') tableId: string) {
    return this.restaurantsService.deleteTable(tableId);
  }

  // ================================
  // SEAT CRUD
  // ================================


  @Post('tables/:tableId/seats')
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
