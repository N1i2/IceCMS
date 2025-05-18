import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateUpdateResourceDto } from './dto/CreateUpdateResourceDto';
import { ResourceDto } from './dto/ResourceDto';

@Controller('resource')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  findAll(): Promise<ResourceDto[]> {
    return this.resourcesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ResourceDto> {
    return this.resourcesService.findOne(id);
  }

  @Post()
  create(@Body() resourceDto: CreateUpdateResourceDto):Promise<ResourceDto> {
    return this.resourcesService.create(resourceDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() resourceDto: CreateUpdateResourceDto,
  ): Promise<ResourceDto> {
    return this.resourcesService.update(id, resourceDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.resourcesService.delete(id);
  }
}
