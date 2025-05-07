import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v7 as uuidv7 } from 'uuid';
import { CreateUpdateUserDto } from './dto/CreateUpdateUserDto';
import { createUserDto, UserDto } from './dto/UserDto';
import * as bcrypt from 'bcrypt';
import { UserRole } from './const/userRoles';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDto>,
  ) {}

  async findAll(): Promise<UserDto[]> {
    const users = await this.userModel.find().exec();
    return users.map((user) => createUserDto(user));
  }

  async findOne(id: string): Promise<UserDto> {
    const existingUser = await this.userModel.findOne({ _id: id }).exec();
    if (!existingUser) {
      throw new NotFoundException(`User with id "${id}" not found.`);
    }
    return createUserDto(existingUser);
  }

  async create(userDto: CreateUpdateUserDto): Promise<UserDto> {
    if (!userDto.password || userDto.password.trim().length === 0) {
      throw new BadRequestException('Password is required.');
    }

    const existingUser = await this.userModel
      .findOne({ email: userDto.email })
      .exec();
    if (existingUser) {
      throw new ConflictException(
        `User with email "${userDto.email}" already exists.`,
      );
    }

    const hashedPassword = await hashPassword(userDto.password);

    const newUser = new this.userModel({
      _id: uuidv7(),
      email: userDto.email,
      passwordHash: hashedPassword,
      role: userDto.role || UserRole,
      lock: userDto.lock ?? false,
    });

    const savedUser = await newUser.save();
    return createUserDto(savedUser);
  }

  async update(id: string, userDto: CreateUpdateUserDto): Promise<UserDto> {
    const existingUser = await this.userModel.findOne({ _id: id }).exec();
    if (!existingUser) {
      throw new NotFoundException(`User with id "${id}" not found.`);
    }

    if (userDto.password) {
      userDto.password = await hashPassword(userDto.password);
    } else {
      delete userDto.password;
    }

    const savedUser = await this.userModel
      .findOneAndUpdate({ _id: id }, userDto, { new: true })
      .exec();

    if (!savedUser) {
      throw new NotFoundException(`User with id "${id}" not found.`);
    }

    return createUserDto(savedUser);
  }

  async delete(id: string): Promise<void> {
    const existingUser = await this.userModel.findOne({ _id: id }).exec();
    if (!existingUser) {
      throw new NotFoundException(`User with id "${id}" not found.`);
    }
    await this.userModel.findOneAndDelete({ _id: id }).exec();
  }
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 15;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
}
