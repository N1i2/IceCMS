import { Resource } from "../schema/resource.schema";

export interface ResourceDto {
  id: string;
  name: string;
  type: string;
  value: string;
  creater: number;
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
