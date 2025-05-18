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
import { UserController } from  '../user_module/user.controller';
import { UserModule } from      '../user_module/user.module';
import { UserService } from     '../user_module/user.service';
import { AuthModule } from      '../auth/auth.module';
import { PageViewController } from 'src/page_module/page.view.controller';
import { PagesViewService } from 'src/page_module/pages.view.service';

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
    UserModule,
    AuthModule,
  ],
  controllers: [
    CmsController,
    ResourcesController,
    TemplateController,
    PagesController,
    UserController,
    PageViewController,
  ],
  providers: [
    CmsService,
    ResourcesService,
    TemplateService,
    PagesService,
    UserService,
    PagesViewService,
  ],
})
export class CmsModule {}

