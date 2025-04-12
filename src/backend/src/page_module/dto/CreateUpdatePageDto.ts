export interface CreateUpdatePageDto {
  id?: string;
  pageId: string;
  name: string;
  templateId: string;
  resources: Map<string, string>;
  scripts: string[];
  creater: string;
}
