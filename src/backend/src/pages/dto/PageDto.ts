import { Page } from "../schema/pages.schema";

export interface PageDto {
  id: string;
  pageId: string;
  name: string;
  templateId: string;
  scripts: string[];
  creater: string;
}

export function createPageDto(jsonSource: Page): PageDto {
  return {
    id: jsonSource.id,
    pageId: jsonSource.pageId,
    name: jsonSource.name,
    templateId: jsonSource.templateId,
    scripts: jsonSource.scripts,
    creater: jsonSource.creater,
  };
}
