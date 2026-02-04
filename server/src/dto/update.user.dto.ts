/* eslint-disable prettier/prettier */
import { UserRole } from 'generated/prisma/enums';

export class UpdateMemberDto {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: UserRole;
}
