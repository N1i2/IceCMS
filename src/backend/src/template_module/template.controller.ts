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
  findAll(): Promise<TemplateDto[]> {
    return this.templateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TemplateDto> {
    return this.templateService.findOne(id);
  }

  @Post()
  create(@Body() templateDto: CreateUpdateTemplateDto): Promise<TemplateDto> {
    return this.templateService.create(templateDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() templateDto: CreateUpdateTemplateDto,
  ): Promise<TemplateDto> {
    return this.templateService.update(id, templateDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.templateService.delete(id);
  }
}
