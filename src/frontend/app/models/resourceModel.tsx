export type ResourceType = 'text' | 'image' | 'script';

export interface ResourceModel {
  id?: string;
  name: string; 
  type: ResourceType; 
  value: string; 
  creater: number;
}