/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { UserRole } from 'generated/prisma/enums';
import { Permission } from './permission.enum';

@Injectable()
export class PermissionService {
  // Assign permissions per role
  private readonly rolePermissions: Record<UserRole, Permission[]> = {
    OWNER: [
      Permission.CREATE_RESTAURANT,
      Permission.UPDATE_RESTAURANT,
      Permission.DELETE_RESTAURANT,
      Permission.VIEW_RESTAURANT,

      Permission.CREATE_TABLE,
      Permission.UPDATE_TABLE,
      Permission.DELETE_TABLE,

      Permission.ADD_SEAT,
      Permission.DELETE_SEAT,

      Permission.CREATE_MENU,
      Permission.UPDATE_MENU,
      Permission.DELETE_MENU,
    ],
    STAFF: [
      Permission.VIEW_RESTAURANT,
      Permission.VIEW_ORDERS, // if you want to track orders
    ],
    CUSTOMER: [
      Permission.VIEW_RESTAURANT, // maybe only view menus/restaurants
      // customers generally don't need table/menu management permissions
    ],
  };

  // Get all permissions for a role
  getRolePermissions(role: UserRole): Permission[] {
    return this.rolePermissions[role] ?? [];
  }

  // Check if a role has a specific permission
  hasPermission(role: UserRole, permission: Permission): boolean {
    const perms = this.rolePermissions[role];
    if (!perms) return false; // role not found
    return perms.includes(permission);
  }
}
