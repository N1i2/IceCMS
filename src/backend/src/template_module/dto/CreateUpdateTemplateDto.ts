export interface CreateUpdateTemplateDto {
  name: string;
  templateHtml: string;
  templateCss: string;
  zones: string[];
  creater: string;
}