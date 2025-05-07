import { ResourceType } from './const/ConstantTypes';

export interface ResourceModel {
  id?: string;
  name: string; 
  type: ResourceType; 
  value: string; 
  creater: string;
}