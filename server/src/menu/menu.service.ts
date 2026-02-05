/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, MenuItem } from 'generated/prisma/client';
import { CreateMenuItemDto, UpdateMenuItemDto } from '../dto/menu-item.dto';
import {
  FoodMeetCloudinaryService,
  FoodMeetUploadType,
} from '../shared/cloudinary/cloudinary.service';
import { Express } from 'express';


@Injectable()
export class MenuService {
  private prisma = new PrismaClient();

  constructor(private cloudinaryService: FoodMeetCloudinaryService) {}

  // ================================
  // CREATE MENU ITEM
  // ================================
  async createMenuItem(
    ownerId: string,
    restaurantId: string,
    dto: CreateMenuItemDto,
    file?: Express.Multer.File,
  ): Promise<MenuItem> {
    let imageUrl: string | undefined;
  
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadMedia(
        file,
        FoodMeetUploadType.FOOD_IMAGE,
      );
      imageUrl = uploadResult.secure_url;
    }
  
    const menuItem = await this.prisma.menuItem.create({
      data: {
        restaurantId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        imageUrl,
        isAvailable: dto.isAvailable ?? true,
      },
    });
  
    return menuItem;
  }
  


  // ================================
  // GET ALL MENU ITEMS FOR A RESTAURANT
  // ================================
// ================================
// GET ALL MENU ITEMS (SINGLE RESTAURANT MODE)
// ================================
async getMenuItems(): Promise<MenuItem[]> {
  const restaurant = await this.prisma.restaurant.findFirst();
  if (!restaurant) {
    throw new NotFoundException('No restaurant found');
  }

  return this.prisma.menuItem.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: 'desc' },
  });
}

  
  

  // ================================
  // GET SINGLE MENU ITEM
  // ================================
  async getMenuItem(menuItemId: string): Promise<MenuItem> {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  // ================================
  // UPDATE MENU ITEM
  // ================================
  async updateMenuItem(
    menuItemId: string,
    dto: UpdateMenuItemDto,
    file?: Express.Multer.File,
  ): Promise<MenuItem> {
    const existing = await this.getMenuItem(menuItemId);

    let imageUrl = dto.imageUrl ?? existing.imageUrl;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadMedia(
        file,
        FoodMeetUploadType.FOOD_IMAGE,
      );
      imageUrl = uploadResult.secure_url;
    }

    const updated = await this.prisma.menuItem.update({
      where: { id: menuItemId },
      data: {
        ...dto,
        imageUrl,
      },
    });

    return updated;
  }

  // ================================
  // DELETE MENU ITEM
  // ================================
  async deleteMenuItem(menuItemId: string): Promise<{ success: boolean }> {
    await this.getMenuItem(menuItemId); // throws if not found
    await this.prisma.menuItem.delete({ where: { id: menuItemId } });
    return { success: true };
  }
}
