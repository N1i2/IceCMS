import { Injectable } from '@nestjs/common';

@Injectable()
export class CmsService {
  getStatus() {
    return { status: 'Smart CMS is running!' };
  }
}
