import { Resource } from '../schema/resource.schema';
import { ResourceType } from '../const/resourceTypes';

export interface ResourceDto {
  id: string;
  name: string;
  type: ResourceType;
  value: string;
  creater: string;
}

export function createResourceDto(jsonSource: Resource): ResourceDto {
  return {
    id: jsonSource.id,
    name: jsonSource.name,
    type: jsonSource.type,
    value: jsonSource.value,
    creater: jsonSource.creater,
  };
}
