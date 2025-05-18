import { ResourceType } from '../const/resourceTypes';

export interface CreateUpdateResourceDto {
  name: string;
  type: ResourceType;
  value: string;
  creater: string;
}
