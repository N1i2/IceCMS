import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { CreateUpdateTemplateDto } from './dto/CreateUpdateTemplateDto';
import { createTemplateDto, TemplateDto } from './dto/TemplateDto';


@Injectable()
export class TemplateService {
  constructor(
    @InjectModel('Template') private readonly templateModel: Model<TemplateDto>,
  ) {}

  async findAll(): Promise<TemplateDto[]> {
    const template = await this.templateModel.find().exec();
    return template.map((template) => createTemplateDto(template));
  }

  async findOne(id: string): Promise<TemplateDto> {
    const existingTemplate = await this.templateModel
      .findOne({ _id: id })
      .exec();

    if (!existingTemplate) {
      throw new NotFoundException(`Template with name "${id}" not found.`);
    }

    return createTemplateDto(existingTemplate);
  }

  async create(templateDto: CreateUpdateTemplateDto): Promise<TemplateDto> {
    const existingTemplate = await this.templateModel
      .findOne({ name: templateDto.name })
      .exec();

    if (existingTemplate)
      throw new NotFoundException(
        `Resource with name "${templateDto.name}" already exists.`,
      );

    const newTemplate = new this.templateModel({
      _id: uuidv7(),
      ...templateDto,
    });

    const savedTemplate = await newTemplate.save();

    return createTemplateDto(savedTemplate);
  }

  async update(id: string, templateDto): Promise<TemplateDto> {
    const existingTemplate = await this.templateModel
      .findOne({ _id: id })
      .exec();

    if (!existingTemplate) {
      throw new NotFoundException(`Resource with id "${id}" not found.`);
    }

    const savedTemplate = await this.templateModel
      .findOneAndUpdate({ _id: id }, templateDto, { new: true })
      .exec();

    if (!savedTemplate) {
      throw new NotFoundException(`Resource with id "${id}" not found.`);
    }

    return createTemplateDto(savedTemplate);
  }

  async delete(id: string): Promise<void> {
    const existingTemplate = await this.templateModel
      .findOne({ _id: id })
      .exec();

    if (!existingTemplate) {
      throw new NotFoundException(`Resource with name "${id}" not found.`);
    }

    await this.templateModel.findOneAndDelete({ _id: id }).exec();
  }
}
