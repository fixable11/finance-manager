import { Injectable, Logger } from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { Model } from 'mongoose';
import { Bank, BankDocument } from './schemas/bank.schema';
import { InjectModel } from '@nestjs/mongoose';

const LIST_LIMIT = 10;

@Injectable()
export class BanksService {
  constructor(
    @InjectModel(Bank.name) private readonly bank: Model<BankDocument>,
  ) {}

  async create(createBankDto: CreateBankDto): Promise<Bank> {
    return await this.bank.create(createBankDto);
  }

  async findAll(page): Promise<Bank[]> {
    const skip = (parseInt(page) - 1) * LIST_LIMIT;

    return await this.bank.find({}).skip(-5).limit(LIST_LIMIT).exec();
  }

  async findOne(id: string): Promise<Bank> {
    return await this.bank.findOne({ _id: id }).exec();
  }

  async update(id: string, updateBankDto: UpdateBankDto) {
    return await this.bank.findOneAndUpdate({ _id: id }, updateBankDto).exec();
  }

  async remove(id: string) {
    return await this.bank.findByIdAndRemove(id).exec();
  }
}
