/* eslint-disable prettier/prettier */
 
 
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'generated/prisma/client';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Define a type for the expiresIn option to satisfy TypeScript
type JwtExpiresIn = string;

@Injectable()
export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: JwtExpiresIn;

  constructor(private configService: ConfigService) {
    this.secret = configService.get<string>('JWT_SECRET') || 'default-secret';
    this.expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '24h';
  }

  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as any);
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as unknown as JwtPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token', error);
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try{
        return jwt.decode(token) as unknown as JwtPayload;
    } catch {
        return null;
    }
  }

  extractTokenFromHeader(authHeader: string): string {
    if(!authHeader || !authHeader.startsWith('Bearer')) {
        throw new UnauthorizedException('Missing or Invalid token');
    }
    return authHeader.substring(7);
  }
}
