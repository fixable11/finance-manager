import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Document } from 'mongoose';
import { Bank } from '../../banks/schemas/bank.schema';
import { Category } from '../../category/schemas/category.schema';

export type TransactionDocument = HydratedDocument<Transaction>;

export enum TransactionType {
  PROFITABLE = 'profitable',
  CONSUMABLE = 'consumable',
}

@Schema({ timestamps: false })
export class Transaction extends Document {
  @Prop({ type: String, required: true })
  amount: number;

  @Prop({ type: String, required: true, enum: Object.values(TransactionType) })
  type: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Bank' })
  bank: Bank;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
  categories: Category[];

  getId: () => string;

  toJson: () => Record<string, any>;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.methods.getId = function (): string {
  return this._id;
};

TransactionSchema.methods.toJson = function (): Record<string, any> {
  const { _id, amount, type, bank, categories } = this;

  return {
    _id,
    amount,
    type,
    bank: bank.toJson(),
    categories: categories.map((category) => category.toJson()),
  };
};

TransactionSchema.post('save', async function (doc, next) {
  await doc.populate('bank');
  doc.bank.balance += Number(doc.amount);
  doc.bank.save();

  next();
});

TransactionSchema.post('findOneAndRemove', async function (doc, next) {
  await doc.populate('bank');
  if (doc.bank) {
    doc.bank.balance -= Number(doc.amount);
    doc.bank.save();
  }

  next();
});
