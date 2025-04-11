export interface ResourceModel {
  id?: string;
  name: string; 
  type: 'Text' | 'Image' | 'Script'; 
  value: string; 
  creater: number;
}