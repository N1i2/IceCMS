import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ResourcesController } from '../resource_module/resources.controller';
import { ResourcesModule } from '../resource_module/resources.module';
import { ResourcesService } from '../resource_module/resources.service';
import { TemplateController } from '../template_module/template.controller';
import { TemplateModule } from '../template_module/template.module';
import { TemplateService } from '../template_module/template.service';
import { PagesController } from '../page_module/pages.controller';
import { PagesModule } from '../page_module/pages.module';
import { PagesService } from '../page_module/pages.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.docker', '.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    PagesModule,
    TemplateModule,
    ResourcesModule,
  ],
  controllers: [
    CmsController,
    ResourcesController,
    TemplateController,
    PagesController,
  ],
  providers: [CmsService, ResourcesService, TemplateService, PagesService],
})
export class CmsModule {}
