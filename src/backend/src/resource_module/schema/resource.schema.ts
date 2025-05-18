import { Schema, Document } from 'mongoose';
import { ResourceType } from '../const/resourceTypes';

export interface Resource extends Document {
  id: string;
  name: string;
  type: ResourceType;
  value: string;
  creater: string;
}

export const ResourceSchema = new Schema<Resource>(
  {
    _id: { type: String },
    name: { type: String, required: true },
    type: { type: String, required: true },
    value: { type: String, required: true },
    creater: { type: String, required: true },
  },
  { timestamps: true },
);

ResourceSchema.virtual('id').get(function (this: Resource) {
  return this._id;
});

ResourceSchema.set('toJSON', { virtuals: true });
