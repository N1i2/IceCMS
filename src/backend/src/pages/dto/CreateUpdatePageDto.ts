export interface CreateUpdatePageDto {
  pageId: string;
  name: string;
  templateId: string;
  scripts: string[];
  creater: string;
}
