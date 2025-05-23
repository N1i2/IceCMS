import { Test, TestingModule } from '@nestjs/testing';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { beforeEach, describe } from '@jest/globals';

describe('CmsController', () => {
  let cmsController: CmsController;

  beforeEach(async () => {
    const cms: TestingModule = await Test.createTestingModule({
      controllers: [CmsController],
      providers: [CmsService],
    }).compile();

    cmsController = cms.get<CmsController>(CmsController);
  });
});
