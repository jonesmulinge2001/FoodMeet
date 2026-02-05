/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from 'generated/prisma/enums';
export class RegisterUserDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be atleast 2 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  @IsNotEmpty({ message: 'Name is required' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  name: string;

    @IsEmail({}, {message: 'Invalid email format'})
    @IsNotEmpty({message: 'Email is required'})
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    email: string;

    @IsNotEmpty({message: 'Password is required'})
    @MinLength(6, {message: 'Password must be at least 6 characters long'})
    password: string;

    @Transform(({ value }) => {
      if (!value) return value;
      let phone = value.trim();
    
      if (phone.startsWith('0')) {
        phone = '+254' + phone.slice(1);
      }
    
      if (phone.startsWith('254')) {
        phone = '+' + phone;
      }
    
      return phone;
    })
    @IsPhoneNumber('KE')
    phone?: string;
    

    @IsNotEmpty({message: 'Role is required'})
    @IsString({message: 'Role must be a string'})
    @Transform(({value}) => value.trim())
    @IsEnum(UserRole, {
        message: 'Invalid role. Please choose from: ${#EnumValues}',
    })
    role: UserRole;
}
