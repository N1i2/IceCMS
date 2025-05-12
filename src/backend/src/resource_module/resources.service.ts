import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v7 as uuidv7 } from 'uuid';
import { CreateUpdateResourceDto } from './dto/CreateUpdateResourceDto';
import { createResourceDto, ResourceDto } from './dto/ResourceDto';
import { ImageType } from './const/resourceTypes';
import {
  YANDEX_DISK_FOLDER,
  PUBLIC_YANDEX_DISK_URL,
} from './const/yandexAddressString';
import { createClient } from 'webdav';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectModel('Resource') private readonly resourceModel: Model<ResourceDto>,
  ) {}

  async findAll(): Promise<ResourceDto[]> {
    const resources = await this.resourceModel.find().exec();
    const resourcesWithImages: ResourceDto[] = [];

    for (const resource of resources) {
      if (resource.type === ImageType) {
        const publicUrl = resource.value;
        const parts = publicUrl.split('/');
        const filename = decodeURIComponent(parts[parts.length - 1]);
        const remotePath = `${YANDEX_DISK_FOLDER}/${filename}`;

        try {
          const client = createClient('https://webdav.yandex.ru', {
            username: process.env.YANDEX_USERNAME,
            password: process.env.YANDEX_APP_PASSWORD,
          });

          const imageData = await client.getFileContents(remotePath, {
            format: 'binary',
          });

          const buffer = imageData as Buffer;
          resource.value = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(`Failed to retrieve...: ${error.message}`);
          } else {
            console.error('Unknown error occurred');
          }
        }
      }

      resourcesWithImages.push(createResourceDto(resource));
    }

    return resourcesWithImages;
  }

  async findOne(id: string): Promise<ResourceDto> {
    const existingResource = await this.resourceModel
      .findOne({ _id: id })
      .exec();

    if (!existingResource) {
      throw new NotFoundException(`Resource with id "${id}" not found.`);
    }

    if (existingResource.type === ImageType) {
      const publicUrl = existingResource.value;
      const parts = publicUrl.split('/');
      const filename = decodeURIComponent(parts[parts.length - 1]);
      const remotePath = `${YANDEX_DISK_FOLDER}/${filename}`;

      try {
        const client = createClient('https://webdav.yandex.ru', {
          username: process.env.YANDEX_USERNAME,
          password: process.env.YANDEX_APP_PASSWORD,
        });

        const imageData = await client.getFileContents(remotePath, {
          format: 'binary',
        });

        const buffer = imageData as Buffer;
        existingResource.value = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new NotFoundException(
            `Failed to retrieve image from Yandex Disk: ${error.message}`,
          );
        }
        throw new NotFoundException(
          'Unknown error occurred while accessing Yandex Disk',
        );
      }
    }

    return createResourceDto(existingResource);
  }

  async create(resourceDto: CreateUpdateResourceDto): Promise<ResourceDto> {
    const existingResource = await this.resourceModel
      .findOne({ name: resourceDto.name })
      .exec();

    if (existingResource) {
      throw new NotFoundException(
        `Resource with name "${resourceDto.name}" already exists.`,
      );
    }

    if (resourceDto.type === ImageType) {
      const client = createClient('https://webdav.yandex.ru', {
        username: process.env.YANDEX_USERNAME,
        password: process.env.YANDEX_APP_PASSWORD,
      });

      try {
        const mimeType = resourceDto.value.split(';')[0].split(':')[1];
        const extension = mimeType.split('/')[1];
        const filename = `${uuidv7()}.${extension}`;
        const remotePath = `${YANDEX_DISK_FOLDER}/${filename}`;

        const base64Data = resourceDto.value.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');

        await client.putFileContents(remotePath, imageBuffer, {
          overwrite: true,
        });

        const publicUrl = `${PUBLIC_YANDEX_DISK_URL}/${encodeURIComponent(filename)}`;
        resourceDto.value = publicUrl;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new NotFoundException(`Image upload failed: ${error.message}`);
        }
        throw new NotFoundException('Unknown error with Image upload');
      }
    }

    const newResource = new this.resourceModel({
      _id: uuidv7(),
      ...resourceDto,
    });

    const savedResource = await newResource.save();
    return createResourceDto(savedResource);
  }

  async update(
    id: string,
    resourceDto: CreateUpdateResourceDto,
  ): Promise<ResourceDto> {
    const existingResource = await this.resourceModel
      .findOne({ _id: id })
      .exec();

    if (!existingResource) {
      throw new NotFoundException(`Resource with id "${id}" not found.`);
    }

    if (resourceDto.type === ImageType) {
      const client = createClient('https://webdav.yandex.ru', {
        username: process.env.YANDEX_USERNAME,
        password: process.env.YANDEX_APP_PASSWORD,
      });

      try {
        if (
          existingResource.value &&
          existingResource.value.includes(PUBLIC_YANDEX_DISK_URL)
        ) {
          const parts = existingResource.value.split('/');
          const oldFilename = decodeURIComponent(parts[parts.length - 1]);
          const oldRemotePath = `${YANDEX_DISK_FOLDER}/${oldFilename}`;

          await client.deleteFile(oldRemotePath);
        }

        const endname = resourceDto.value.split(';')[0].split('/')[1];
        const filename = `${uuidv7()}.${endname}`;
        const remotePath = `${YANDEX_DISK_FOLDER}/${filename}`;

        const base64Data = resourceDto.value.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        await client.putFileContents(remotePath, imageBuffer, {
          overwrite: true,
        });

        const publicUrl = `${PUBLIC_YANDEX_DISK_URL}/${encodeURIComponent(filename)}`;
        resourceDto.value = publicUrl;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new NotFoundException(
            `Failed to retrieve image from Yandex Disk: ${error.message}`,
          );
        }
        throw new NotFoundException(
          'Unknown error occurred while accessing Yandex Disk',
        );
      }
    }

    const savedResource = await this.resourceModel
      .findOneAndUpdate({ _id: id }, resourceDto, { new: true })
      .exec();

    if (!savedResource) {
      throw new NotFoundException(`Resource with id "${id}" not found.`);
    }

    return createResourceDto(savedResource);
  }

  async delete(id: string): Promise<void> {
    const existingResource = await this.resourceModel
      .findOne({ _id: id })
      .exec();

    if (!existingResource) {
      throw new NotFoundException(`Resource with id "${id}" not found.`);
    }

    if (
      existingResource.type === ImageType &&
      existingResource.value.includes(PUBLIC_YANDEX_DISK_URL)
    ) {
      try {
        const parts = existingResource.value.split('/');
        const filename = decodeURIComponent(parts[parts.length - 1]);
        const remotePath = `${YANDEX_DISK_FOLDER}/${filename}`;

        const client = createClient('https://webdav.yandex.ru', {
          username: process.env.YANDEX_USERNAME,
          password: process.env.YANDEX_APP_PASSWORD,
        });

        await client.deleteFile(remotePath);
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new NotFoundException(
            `Failed to delete image from Yandex Disk: ${error.message}`,
          );
        }
        throw new NotFoundException(
          'Unknown error occurred while accessing Yandex Disk',
        );
      }
    }

    await this.resourceModel.findOneAndDelete({ _id: id }).exec();
  }
}
