import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { Model } from 'mongoose';
import { Bank, BankDocument } from './schemas/bank.schema';
import { InjectModel } from '@nestjs/mongoose';
import { validateId } from '../common/validation/entity.validation';

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

    return await this.bank.find({}).skip(skip).limit(LIST_LIMIT).exec();
  }

  async findOne(id: string): Promise<Bank> {
    validateId(id);

    const bank: Bank | null = await this.bank.findOne({ _id: id }).exec();

    if (!bank) {
      throw new NotFoundException('Bank was not found');
    }

    return bank;
  }

  async update(id: string, updateBankDto: UpdateBankDto) {
    validateId(id);

    return await this.bank.findOneAndUpdate({ _id: id }, updateBankDto).exec();
  }

  async remove(id: string) {
    validateId(id);

    return await this.bank.findByIdAndRemove(id).exec();
  }
}
