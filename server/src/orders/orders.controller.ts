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
// CUSTOMER: PLACE ORDER
@Post()
async createOrder(@Body() dto: CreateOrderDto, @Req() req: any) {
  const customerId = req.user?.id ?? null;
  return this.ordersService.createOrder(customerId, dto);
}

  // =====================================================
  // WAITER / STAFF: VIEW ALL ORDERS
  // =====================================================
@Get('all')
async getAllOrders() {
  return this.ordersService.getAllOrders();
}

  // =====================================================
  // WAITER: VIEW DINE-IN ORDERS
  // =====================================================
  @Get('dine-in')
  async getDineInOrders() {
    return this.ordersService.getDineInOrders();
  }
  
  @Get('takeaway')
  async getTakeawayOrders() {
    return this.ordersService.getTakeawayOrders();
  }
  
  @Get('delivery')
  async getDeliveryOrders() {
    return this.ordersService.getDeliveryOrders();
  }
  // =====================================================
  // WAITER: CONFIRM ORDER
  // =====================================================
// CONFIRM ORDER
@Patch(':orderId/confirm')
async confirmOrder(@Param('orderId') orderId: string) {
  return this.ordersService.confirmOrder(orderId);
}

// DELIVER ORDER
@Patch(':orderId/deliver')
async deliverOrder(@Param('orderId') orderId: string) {
  return this.ordersService.deliverOrder(orderId);
}
}
