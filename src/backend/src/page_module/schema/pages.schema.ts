import { Schema, Document } from 'mongoose';
import { Resource } from 'src/resource_module/schema/resource.schema';

export interface Page extends Document {
  id: string;
  pageId: string;
  name: string;
  templateId: string;
  resources: Map<string, string>;
  scripts: string[];
  rawHtml: string;
  creater: string;
}

export const PageSchema = new Schema<Page>(
  {
    _id: { type: String },
    pageId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    templateId: { type: String, required: true },
    scripts: { type: [String], require: true },
    resources: { type: Map, of: String, require: true },
    rawHtml: { type: String, required: true },
    creater: { type: String, required: true },
  },
  { timestamps: true },
);

PageSchema.virtual('id').get(function (this: Resource) {
  return this._id;
});

PageSchema.set('toJSON', { virtuals: true });
