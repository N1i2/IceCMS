import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user_module/user.service';
import * as bcrypt from 'bcrypt';
import { UserDto } from '../user_module/dto/UserDto';
import { CreateUpdateUserDto } from '../user_module/dto/CreateUpdateUserDto';
import { UserRole } from '../user_module/const/userRoles';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDto | null> {
    const users = await this.usersService.findAll();
    const user = users.find((u) => u.email === email);
    if (!user) {
      return null;
    }
    if (user.lock) {
      throw new UnauthorizedException('Account is locked');
    }
    if (await bcrypt.compare(password, user.passwordHash)) {
      return user;
    }

    return null;
  }

  async login(user: UserDto) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(dto: CreateUpdateUserDto) {
    return await this.usersService.create({
      ...dto,
      role: UserRole,
      lock: false,
    });
  }
}
