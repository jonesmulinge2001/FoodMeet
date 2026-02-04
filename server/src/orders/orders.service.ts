/* eslint-disable prettier/prettier */
 
 
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrdersGateway } from './orders.gateway';
import { OrderStatus, OrderType, PrismaClient } from 'generated/prisma/client';
import { CreateOrderDto } from 'src/dto/create-order.dto';

@Injectable()
export class OrdersService {
  private prisma = new PrismaClient();
  constructor(private ordersGateway: OrdersGateway) {}

  async createOrder(
    restaurantId: string,
    customerId: string | null,
    dto: CreateOrderDto,
  ) {
    // 1. Validate table number if DINE_IN
    if (dto.orderType === OrderType.DINE_IN) {
      // 1️⃣ Validate table number
      const table = await this.prisma.table.findFirst({
        where: { restaurantId, tableNumber: dto.tableNumber },
      });
      if (!table) throw new BadRequestException('Table number does not exist');
    
      // 2️⃣ Validate seat number for this table
      const seat = await this.prisma.seat.findFirst({
        where: { tableId: table.id, seatNumber: dto.seatNumber },
      });
      if (!seat) throw new BadRequestException('Seat number does not exist');
    }
    

    // 2. Fetch menu items
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: dto.items.map((i) => i.menuItemId) },
        restaurantId,
        isAvailable: true,
      },
    });

    if (menuItems.length !== dto.items.length) {
      throw new BadRequestException('One or more items are unavailable');
    }

    // 3. Calculate total
    const totalAmount = dto.items.reduce((sum, item) => {
      const menu = menuItems.find((m) => m.id === item.menuItemId)!;
      return sum + menu.price * item.quantity;
    }, 0);

    // 4. Create order
    const order = await this.prisma.order.create({
      data: {
        restaurantId,
        customerId,
        orderType: dto.orderType,
        tableNumber: dto.tableNumber,
        seatNumber: dto.seatNumber,
        deliveryAddress: dto.deliveryAddress,
        deliveryPhone: dto.deliveryPhone,
        totalAmount,
        status: OrderStatus.PENDING,
        items: {
          create: dto.items.map((item) => {
            const menu = menuItems.find((m) => m.id === item.menuItemId)!;
            return {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: menu.price,
            };
          }),
        },
      },
      include: { items: true },
    });

    // 5. Emit real-time event
    this.ordersGateway.emitNewOrder(order);

    return order;
  }

// ------------------------------
// WAITER: VIEW ALL ORDERS
// ------------------------------
async getAllOrders(restaurantId: string) {
  return this.prisma.order.findMany({
    where: { restaurantId },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
}

// ------------------------------
// WAITER: DINE-IN ORDERS
// ------------------------------
async getDineInOrders(restaurantId: string) {
  return this.prisma.order.findMany({
    where: {
      restaurantId,
      orderType: OrderType.DINE_IN,
    },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
}

// ------------------------------
// WAITER: TAKEAWAY ORDERS
// ------------------------------
async getTakeawayOrders(restaurantId: string) {
  return this.prisma.order.findMany({
    where: {
      restaurantId,
      orderType: OrderType.TAKEAWAY,
    },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
}

// ------------------------------
// WAITER: DELIVERY ORDERS
// ------------------------------
async getDeliveryOrders(restaurantId: string) {
  return this.prisma.order.findMany({
    where: {
      restaurantId,
      orderType: OrderType.DELIVERY,
    },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
}


  // ------------------------------
  // CONFIRM ORDER
  // ------------------------------
  async confirmOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.PENDING)
      throw new BadRequestException('Only pending orders can be confirmed');

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CONFIRMED },
    });

    this.ordersGateway.emitOrderConfirmed(updatedOrder);
    return updatedOrder;
  }

  // ------------------------------
  // DELIVER ORDER
  // ------------------------------
  async deliverOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.CONFIRMED)
      throw new BadRequestException('Only confirmed orders can be delivered');

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.DELIVERED },
    });

    this.ordersGateway.emitOrderDelivered(updatedOrder);
    return updatedOrder;
  }
}
