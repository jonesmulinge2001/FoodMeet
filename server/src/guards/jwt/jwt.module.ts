/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from '../../strategies/jwt.strategy';
import { JwtService } from './jwt.service';

@Module({
  imports: [PassportModule, ConfigModule],
  providers: [JwtService, JwtStrategy],
  exports: [JwtService, JwtStrategy],
})
export class JwtModule {}
