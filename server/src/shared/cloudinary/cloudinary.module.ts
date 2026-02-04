/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FoodMeetCloudinaryService } from './cloudinary.service';

@Module({
  imports: [ConfigModule],
  providers: [FoodMeetCloudinaryService],
  exports: [FoodMeetCloudinaryService],
})
export class CloudinaryModule {}
