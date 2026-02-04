/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
 
/* eslint-disable prettier/prettier */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  // ----------------------------------------
  // JOIN RESTAURANT ROOM (STAFF / WAITERS)
  // ----------------------------------------
  @SubscribeMessage('joinRestaurant')
  handleJoinRestaurant(
    @MessageBody() data: { restaurantId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `restaurant:${data.restaurantId}`;
    client.join(room);
  }

  // ----------------------------------------
  // JOIN ORDER ROOM (CUSTOMER)
  // ----------------------------------------
  @SubscribeMessage('joinOrder')
  handleJoinOrder(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `order:${data.orderId}`;
    client.join(room);
  }

  // ----------------------------------------
  // EMIT: NEW ORDER TO RESTAURANT
  // ----------------------------------------
  emitNewOrder(order: any) {
    const room = `restaurant:${order.restaurantId}`;
    this.server.to(room).emit('order.created', order);
  }

  // ----------------------------------------
  // EMIT: ORDER CONFIRMED TO CUSTOMER
  // ----------------------------------------
  emitOrderConfirmed(order: any) {
    const room = `order:${order.id}`;
    this.server.to(room).emit('order.confirmed', order);
  }

  // ----------------------------------------
  // EMIT: ORDER DELIVERED TO CUSTOMER
  // ----------------------------------------
  emitOrderDelivered(order: any) {
    const room = `order:${order.id}`;
    this.server.to(room).emit('order.delivered', order);
  }
}
