import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PageSchema } from './schema/pages.schema';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Page', schema: PageSchema }])],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService, MongooseModule],
})
export class PagesModule {}
