/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailerModule } from './shared/mailer/mailer.module';
import { CloudinaryModule } from './shared/cloudinary/cloudinary.module';
import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';
import { JwtModule } from './guards/jwt/jwt.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [MailerModule, CloudinaryModule, AuthModule, MenuModule, JwtModule, RestaurantsModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
