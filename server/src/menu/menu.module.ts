/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { FoodMeetCloudinaryService } from '../shared/cloudinary/cloudinary.service';
import { JwtService } from '../guards/jwt/jwt.service';
import { PermissionService } from '../permissions/permission.service';

@Module({
  controllers: [MenuController],
  providers: [MenuService, FoodMeetCloudinaryService, JwtService, PermissionService]
})
export class MenuModule {}
