/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateMenuItemDto, UpdateMenuItemDto } from '../dto/menu-item.dto';
import { JwtAuthGuard } from '../guards/jwt/jwtauth.guard';
import { PermissionGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorator/permissions.decorator';
import { Permission } from '../permissions/permission.enum';
import { RequestWithUser } from '../dto/requestWithUser';
import { Express } from 'express';


@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // ================================
  // CREATE MENU ITEM
  // ================================
  @Post(':restaurantId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.CREATE_MENU)
  @UseInterceptors(FileInterceptor('image'))
  async createMenuItem(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateMenuItemDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser
  ) {
    return this.menuService.createMenuItem(req.user.id, restaurantId, dto, file);
  }

  // ================================
  // GET ALL MENU ITEMS
  // ================================
  @Get()
  async getMenuItems() {
    return this.menuService.getMenuItems();
  }

  // ================================
  // GET SINGLE MENU ITEM
  // ================================
  @Get('item/:id')
  async getMenuItem(@Param('id') menuItemId: string) {
    return this.menuService.getMenuItem(menuItemId);
  }

  // ================================
  // UPDATE MENU ITEM
  // ================================
  @Patch('item/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.UPDATE_MENU)
  @UseInterceptors(FileInterceptor('image'))
  async updateMenuItem(
    @Param('id') menuItemId: string,
    @Body() dto: UpdateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.menuService.updateMenuItem(menuItemId, dto, file);
  }

  // ================================
  // DELETE MENU ITEM
  // ================================
  @Delete('item/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.DELETE_MENU)
  async deleteMenuItem(@Param('id') menuItemId: string) {
    return this.menuService.deleteMenuItem(menuItemId);
  }
}
