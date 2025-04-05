import { Schema, Document } from 'mongoose';

export interface Resource extends Document {
  id: string;
  name: string;
  type: string;
  value: string;
  creater: number;
}

export const ResourceSchema = new Schema<Resource>(
  {
    _id: { type: String },
    name: { type: String, required: true },
    type: { type: String, required: true },
    value: { type: String, required: true },
    creater: { type: Number, required: true },
  },
  { timestamps: true },
);

ResourceSchema.virtual('id').get(function (this: Resource) {
  return this._id;
});

ResourceSchema.set('toJSON', { virtuals: true });
