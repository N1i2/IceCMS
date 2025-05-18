import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller'; 
import { UserSchema } from '../user_module/schema/user.schema';
import { UserService } from '../user_module/user.service'; 
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SECRET',
      signOptions: { expiresIn: '1h' },
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [AuthController], 
  providers: [AuthService, JwtStrategy, GoogleStrategy, UserService],
  exports: [AuthService],
})
export class AuthModule {}
