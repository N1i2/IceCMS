import {
    Controller,
    Get,
    Param,
  } from '@nestjs/common';
  import { PagesViewService } from './pages.view.service';
  
  @Controller(':pageId')
  export class PageViewController {
    constructor(private readonly pagesService: PagesViewService) {}
  
    @Get()
    async getRawHtml(@Param('pageId') pageId: string): Promise<string> {
      return this.pagesService.findOne(pageId);
    }
  }
  