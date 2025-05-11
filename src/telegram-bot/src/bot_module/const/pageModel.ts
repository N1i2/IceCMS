export interface Page {
  id: string;
  pageId: string;
  name: string;
  templateId: string;
  resources: Map<string, string>;
  scripts: string[];
  rawHtml: string;
  creater: string;
}