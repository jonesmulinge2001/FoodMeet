/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';

@Module({
  providers: [RestaurantsService,],
  controllers: [RestaurantsController],
  imports: [],
})
export class RestaurantsModule {}
