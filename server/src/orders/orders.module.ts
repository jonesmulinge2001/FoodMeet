import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { OrdersController } from './orders.controller';

@Module({
  providers: [OrdersService, OrdersGateway],
  controllers: [OrdersController],
})
export class OrdersModule {}
