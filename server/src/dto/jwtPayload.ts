/* eslint-disable prettier/prettier */
import { UserRole } from 'generated/prisma/enums';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
