import { Schema, Document } from 'mongoose';
import { Resource } from 'src/resource_module/schema/resource.schema';

export interface Page extends Document {
  id: string;
  pageId: string;
  name: string;
  templateId: string;
  // zones: { zoneName: string; resource: string }[];
  scripts: string[];
  creater: number;
}

export const PageSchema = new Schema<Page>(
  {
    _id: { type: String },
    pageId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    // templateId: {
    //   type: Schema.Types.ObjectId,
    //   required: true,
    //   ref: 'Template',
    // },
    templateId: { type: String },
    // zones: [
    //   {
    //     zoneName: { type: String, required: true },
    //     resource: {
    //       type: Schema.Types.ObjectId,
    //       required: true,
    //       ref: 'Resource',
    //     },
    //   },
    // ],
    scripts: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
    creater: { type: Number, required: true },
  },
  { timestamps: true },
);

PageSchema.virtual('id').get(function (this: Resource) {
  return this._id;
});

PageSchema.set('toJSON', { virtuals: true });
