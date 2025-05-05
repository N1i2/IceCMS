import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { Page } from './schema/pages.schema';

@Injectable()
export class PagesViewService {
  constructor(@InjectModel('Page') private readonly pageModel: Model<Page>) {}

  async findOne(pageId: string): Promise<string> {
    const existingPage = await this.pageModel
    .findOne({ pageId: pageId })
    .exec();

    if (!existingPage) {
      throw new NotFoundException(`Resource with name "${pageId}" not found.`);
    }

    return existingPage.rawHtml;
  }
}
