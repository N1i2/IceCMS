import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreateUpdatePageDto } from './dto/CreateUpdatePageDto';
import { PageDto } from './dto/PageDto';

@Controller('page')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  async findAll(): Promise<PageDto[]> {
    return this.pagesService.findAll();
  }

  @Get(':pageId')
  async findOne(@Param('pageId') pageId: string): Promise<PageDto> {
    return this.pagesService.findOne(pageId);
  }

  @Post()
  async create(@Body() createPageDto: CreateUpdatePageDto): Promise<PageDto> {
    return this.pagesService.create(createPageDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePageDto: CreateUpdatePageDto): Promise<PageDto|null> {
    return this.pagesService.update(id, updatePageDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.pagesService.delete(id);
  }
}
