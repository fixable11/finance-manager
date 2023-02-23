import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: false })
export class Category extends Document {
  @Prop({ type: String, required: true })
  name: string;

  getId: () => string;

  toJson: () => Record<string, any>;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.methods.getId = function (): string {
  return this._id;
};

CategorySchema.methods.toJson = function (): Record<string, any> {
  const { _id, name } = this;

  return {
    _id,
    name,
  };
};
