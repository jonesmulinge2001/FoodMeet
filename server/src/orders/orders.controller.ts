/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // =====================================================
  // CUSTOMER: PLACE ORDER
  // =====================================================
  @Post(':restaurantId')
  async createOrder(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateOrderDto,
    @Req() req: any,
  ) {
    // Customer may be logged in or a guest
    const customerId = req.user?.id ?? null;

    return this.ordersService.createOrder(restaurantId, customerId, dto);
  }

  // =====================================================
  // WAITER / STAFF: VIEW ALL ORDERS
  // =====================================================
  @Get('restaurant/:restaurantId')
  async getAllOrders(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.getAllOrders(restaurantId);
  }

  // =====================================================
  // WAITER: VIEW DINE-IN ORDERS
  // =====================================================
  @Get('restaurant/:restaurantId/dine-in')
  async getDineInOrders(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.getDineInOrders(restaurantId);
  }

  // =====================================================
  // WAITER: VIEW TAKEAWAY ORDERS
  // =====================================================
  @Get('restaurant/:restaurantId/takeaway')
  async getTakeawayOrders(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.getTakeawayOrders(restaurantId);
  }

  // =====================================================
  // WAITER: VIEW DELIVERY ORDERS
  // =====================================================
  @Get('restaurant/:restaurantId/delivery')
  async getDeliveryOrders(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.getDeliveryOrders(restaurantId);
  }

  // =====================================================
  // WAITER: CONFIRM ORDER
  // =====================================================
  @Patch(':orderId/confirm')
  async confirmOrder(@Param('orderId') orderId: string) {
    return this.ordersService.confirmOrder(orderId);
  }

  // =====================================================
  // WAITER: DELIVER ORDER
  // =====================================================
  @Patch(':orderId/deliver')
  async deliverOrder(@Param('orderId') orderId: string) {
    return this.ordersService.deliverOrder(orderId);
  }
}
