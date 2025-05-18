import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateUpdateTemplateDto } from './dto/CreateUpdateTemplateDto';
import { TemplateDto } from './dto/TemplateDto';

@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  async findAll(): Promise<TemplateDto[]> {
    return this.templateService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TemplateDto> {
    return this.templateService.findOne(id);
  }

  @Post()
  async create(@Body() templateDto: CreateUpdateTemplateDto): Promise<TemplateDto> {
    return this.templateService.create(templateDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() templateDto: CreateUpdateTemplateDto,
  ): Promise<TemplateDto> {
    return this.templateService.update(id, templateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.templateService.delete(id);
  }
}
