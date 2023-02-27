import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';

const LIST_LIMIT = 10;

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transaction: Model<TransactionDocument>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const transaction = await this.transaction.create({
      ...createTransactionDto,
      bank: createTransactionDto.bankId,
      categories: createTransactionDto.categoryIds,
    });

    return await transaction.populate(['categories', 'bank']);
  }

  async findAll(page): Promise<Transaction[]> {
    const skip = (parseInt(page) - 1) * LIST_LIMIT;

    return await this.transaction
      .find({})
      .skip(skip)
      .limit(LIST_LIMIT)
      .populate(['bank', 'categories'])
      .exec();
  }

  async remove(id: string) {
    return await this.transaction.findByIdAndRemove(id).exec();
  }

  async findAllByBankId(bankId: string) {
    return await this.transaction.find({ bankId: bankId }).exec();
  }

  async transactionExists(bankId: string): Promise<boolean> {
    return (await this.transaction.find({ bankId: bankId }).count().exec()) > 0;
  }
}
