import { Schema, Document } from 'mongoose';

export interface Template extends Document {
  id: string;
  name: string;
  templateHtml: string;
  templateCss: string;
  zones: string[];
  creater: string;
}

export const TemplateSchema = new Schema<Template>(
  {
    _id: { type: String },
    name: { type: String, required: true },
    templateHtml: { type: String, required: true },
    templateCss: { type: String, require: true },
    zones: { type: [String], require: true },
    creater: { type: String, required: true },
  },
  { timestamps: true },
);

TemplateSchema.virtual('id').get(function (this: Template) {
  return this._id;
});

TemplateSchema.set('toJSON', { virtuals: true });

// TODO: Chose, class or object

// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// @Schema({
//   timestamps: true,
//   toJSON: {
//     virtuals: true,
//   },
//   id: false,
// })
// export class Template extends Document {
//   @Prop({ type: String })
//   declare _id: string;

//   @Prop({ required: true })
//   name: string;

//   @Prop({ required: true })
//   templateHtml: string;

//   @Prop({ required: true })
//   templateCss: string;

//   @Prop({ type: Object, required: true })
//   zones: Record<string, string>;

//   @Prop({ required: true })
//   creater: number;
// }

// export const TemplateSchema = SchemaFactory.createForClass(Template);
