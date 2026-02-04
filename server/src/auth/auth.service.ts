/* eslint-disable prettier/prettier */

/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from 'generated/prisma/client';
import { LoginUserDto } from 'src/dto/login.user.dto';
import { RegisterUserDto } from 'src/dto/register.user.dto';
import { MailerService } from 'src/shared/mailer/mailer.service';


@Injectable()
export class AuthService {
  private prisma: PrismaClient;

  constructor(
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {
    this.prisma = new PrismaClient();
  }

  async register(data: RegisterUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Generate a 5-digit verification code
    const verificationCode = Math.floor(
      10000 + Math.random() * 90000,
    ).toString();

    // set expiry time for the code
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 60);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: data.role,
        verifyToken: verificationCode,
        verifyTokenExpiresAt: expiresAt,
      },
    });

    try {
      await this.mailerService.sendEmail({
        to: user.email,
        subject: 'Verify Your Email - Car Rentals',
        html: `<p>Hi ${user.name},</p>
               <p>Your email verification code is:</p>
               <h2>${verificationCode}</h2>
               <p>Please enter this code on the verification page to activate your account.</p>`,
      });
    } catch (emailError) {
      console.warn(`Failed to send verification email: ${emailError}`);
    }

    return user;
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');
    if (user.isVerified) throw new Error('User already verified');

    if (!user.verifyTokenExpiresAt || new Date() > user.verifyTokenExpiresAt) {
      throw new Error(
        'Verification code has expired. Please request a new one 🙏',
      );
    }

    if (user.verifyToken !== code) throw new Error('Invalid verification code');

    await this.prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verifyToken: '',
        verifyTokenExpiresAt: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async requestNewVerificationCode(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');
    if (user.isVerified) throw new Error('User already verified');

    const newCode = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 1);

    await this.prisma.user.update({
      where: { email },
      data: {
        verifyToken: newCode,
        verifyTokenExpiresAt: expiresAt,
      },
    });

    await this.mailerService.sendEmail({
      to: email,
      subject: 'New Email Verification Code - Car Rentals',
      html: `<p>Hi ${user.name},</p>
      <p>Your new verification code is:</p>
      <h2>${newCode}</h2>
      <p>This code expires in 60s.</p>`,
    });

    return { message: 'New verification code sent successfully' };
  }

  async login(data: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email, isDeleted: false },
    });
    if (!user) throw new NotFoundException('User not found');

    if (!user.isVerified) {
      throw new Error('Please verify your email before logging in.');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) throw new Error('Invalid password');

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  // forgot password
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email, isVerified: true } });
    if (!user) throw new NotFoundException(`User with email (${email}) not found`);

    const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 60);

    await this.prisma.user.update({
      where: { email},
      data: {
        resetToken: resetCode,
        resetTokenExpiresAt: expiresAt,
      },
    });

    await this.mailerService.sendEmail({
      to: email,
      subject: '🗝 Reset Your Password - Car Rentals',
      html: `<p>Your reset code is:</p><h2>${resetCode}</h2><p>This code expires in 60s.</p>`,
    });

    return { message: 'Reset code sent to your email.' };
  }

  // resend reset code
  async resendResetCode(email: string) {
    {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error(`User with email (${email}) not found`);

      const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + 60);

      await this.prisma.user.update({
        where: { email },
        data: {
          resetToken: resetCode,
          resetTokenExpiresAt: expiresAt,
        },
      });

      await this.mailerService.sendEmail({
        to: email,
        subject: 'Reset Your Password - Car Rentals',
        html: `<p>Your new password reset code is:</p><h2>${resetCode}</h2><p>This code expires in 60s.</p>`,
      });

      return { message: 'Reset code sent to your email.' };
    }
  }

  // reset password
  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'Check reset code sent to your email.' };

    if (
      !user.resetToken ||
      !user.resetTokenExpiresAt ||
      new Date() > user.resetTokenExpiresAt
    ) {
      throw new Error('Reset code expired. Please request a new one');
    }

    if (user.resetToken !== code) {
      throw new NotFoundException('Invalid reset code');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    return { message: 'Password reset successfully.' };
  }
}
