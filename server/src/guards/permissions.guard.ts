/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSIONS_KEY } from 'src/decorator/permissions.decorator';
import { Permission } from 'src/permissions/permission.enum';
  import { PermissionService } from 'src/permissions/permission.service';
  
  @Injectable()
  export class PermissionGuard implements CanActivate {
    constructor(
      private reflector: Reflector,
      private permissionService: PermissionService,
    ) {}
  
    canActivate(context: ExecutionContext): boolean {
      const requiredPermissions =
        this.reflector.getAllAndOverride<Permission[]>(
          REQUIRE_PERMISSIONS_KEY,
          [context.getHandler(), context.getClass()],
        );
  
      // 1️⃣ If the route does NOT require permissions → allow access
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
      }
  
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      // 2️⃣ If route requires permissions → user MUST have a role
      if (!user || !user.role) {
        throw new ForbiddenException('You do not have permission to access this resource');
      }
  
      // 3️⃣ Get role-based permissions
      const userPermissions = this.permissionService.getRolePermissions(
        user.role,
      );
  
      // 4️⃣ Check all required permissions
      const hasAllPermissions = requiredPermissions.every((perm) =>
        userPermissions.includes(perm),
      );
  
      if (!hasAllPermissions) {
        throw new ForbiddenException('Insufficient permissions');
      }
  
      return true;
    }
  }
  