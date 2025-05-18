import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { CreateUpdatePageDto } from './dto/CreateUpdatePageDto';
import { createPageDto, PageDto } from './dto/PageDto';
import { Page } from './schema/pages.schema';

@Injectable()
export class PagesService {
  constructor(@InjectModel('Page') private readonly pageModel: Model<Page>) {}

  async findAll(): Promise<PageDto[]> {
    const pages = await this.pageModel.find().exec();
    return pages.map((page) => createPageDto(page));
  }

  async findOne(id: string): Promise<PageDto> {
    const existingPage = await this.pageModel
    .findOne({ _id: id })
    .exec();

    if (!existingPage) {
      throw new NotFoundException(`Resource with name "${id}" not found.`);
    }

    return createPageDto(existingPage);
  }

  async create(pageDto: CreateUpdatePageDto): Promise<PageDto> {
    const existingPage = await this.pageModel
      .findOne({ _id: pageDto.id })
      .exec();

    if (existingPage)
      throw new NotFoundException(
        `Resource with id "${pageDto.id}" already exists.`,
      );

    const newPage = new this.pageModel({
      _id: uuidv7(),
      ...pageDto,
    });

    const savedPage = await newPage.save();
    return createPageDto(savedPage);
  }

  async update(id: string, pageDto: CreateUpdatePageDto): Promise<PageDto> {
    const existingPage = await this.pageModel.findOne({ _id: id }).exec();

    if (!existingPage) {
      throw new NotFoundException(`Resource with id "${id}" not found.`);
    }

    const savedPage = await this.pageModel
      .findOneAndUpdate({ _id: id }, pageDto, { new: true })
      .exec();

    if (!savedPage) {
      throw new NotFoundException(`Resource with id "${id}" not found.`);
    }

    return createPageDto(savedPage);
  }

  async delete(id: string): Promise<void> {
    const existingPage = await this.pageModel.findOne({ _id: id }).exec();

    if (!existingPage) {
      throw new NotFoundException(`Resource with name "${id}" not found.`);
    }

    await this.pageModel.findOneAndDelete({ _id: id }).exec();
  }
}
