import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document } from 'mongoose';

export type BankDocument = HydratedDocument<Bank>;

@Schema({ timestamps: true })
export class Bank extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: true })
  registerNumber: string;

  @Prop({ type: Number, required: false, default: 0 })
  balance: number;

  getId: () => string;

  toJson: () => Record<string, any>;
}

export const BankSchema = SchemaFactory.createForClass(Bank);

BankSchema.methods.getId = function (): string {
  return this._id;
};

BankSchema.methods.toJson = function (): Record<string, any> {
  const { _id, name, address, balance, registerNumber } = this;

  return {
    _id,
    name,
    address,
    balance,
    registerNumber,
  };
};
