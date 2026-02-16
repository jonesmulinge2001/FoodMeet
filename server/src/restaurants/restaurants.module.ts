/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { TablesController } from './restaurants.controller';

@Module({
  providers: [RestaurantsService,],
  controllers: [TablesController],
  imports: [],
})
export class RestaurantsModule {}
