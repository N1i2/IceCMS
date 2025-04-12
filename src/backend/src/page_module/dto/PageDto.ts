import { Page } from "../schema/pages.schema";

export interface PageDto {
  id: string;
  pageId: string;
  name: string;
  templateId: string;
  resources: Map<string, string>;
  scripts: string[];
  creater: string;
}

export function createPageDto(jsonSource: Page): PageDto {
  return {
    id: jsonSource.id,
    pageId: jsonSource.pageId,
    name: jsonSource.name,
    templateId: jsonSource.templateId,
    resources: jsonSource.resources,
    scripts: jsonSource.scripts,
    creater: jsonSource.creater,
  };
}
