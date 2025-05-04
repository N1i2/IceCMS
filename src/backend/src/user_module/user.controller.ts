import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUpdateUserDto } from './dto/CreateUpdateUserDto';
import { UserDto } from './dto/UserDto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserDto> {
    return this.userService.findOne(id);
  }

  @Post()
  create(@Body() userDto: CreateUpdateUserDto): Promise<UserDto> {
    return this.userService.create(userDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() userDto: CreateUpdateUserDto,
  ): Promise<UserDto> {
    return this.userService.update(id, userDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }
}
