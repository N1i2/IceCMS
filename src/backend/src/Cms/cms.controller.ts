import { Controller, Get } from '@nestjs/common';
import { CmsService } from './cms.service';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('status')
  getStatus() {
    return this.cmsService.getStatus();
  }
}
