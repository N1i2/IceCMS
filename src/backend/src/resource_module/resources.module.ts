import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResourceSchema } from './schema/resource.schema';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Resource', schema: ResourceSchema }]),
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [MongooseModule, ResourcesService],
})
export class ResourcesModule {}
