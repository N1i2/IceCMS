import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateSchema } from './schema/template.schema';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Template', schema: TemplateSchema }]),
  ],
  controllers: [TemplateController],
  providers: [TemplateService],
  exports: [MongooseModule, TemplateService],
})
export class TemplateModule {}
