import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUpdateUserDto } from '../user_module/dto/CreateUpdateUserDto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { localIp } from 'src/helpModule/localIp';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: CreateUpdateUserDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: { email: string; password: string }) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = await this.authService.oAuthLogin(req.user.email);
    const token = user.access_token;

    res.redirect(
      `http://${localIp}:3000/login/auth?token=${token}&userId=${user.user.id}&userRole=${user.user.role}`,
    );
  }
}
