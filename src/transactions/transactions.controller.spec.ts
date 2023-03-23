import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { validate } from 'class-validator';
import { stringified } from '../common/test/utils/test.until';
import { BadRequestException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import mongoose, { connect, Connection, Model } from 'mongoose';
import {
  Transaction,
  TransactionSchema,
  TransactionType,
} from './schemas/transaction.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Bank, BankSchema } from '../banks/schemas/bank.schema';
import { Category, CategorySchema } from '../category/schemas/category.schema';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let transactionModel: Model<Transaction>;
  let bankId: string;
  let categoryId: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoose.set('strictQuery', false);
    const { connection } = await connect(uri);
    mongoConnection = connection;
    transactionModel = mongoConnection.model(
      Transaction.name,
      TransactionSchema,
    );
    const categoryModel = mongoConnection.model(Category.name, CategorySchema);
    const bankModel = mongoConnection.model(Bank.name, BankSchema);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: getModelToken(Bank.name), useValue: bankModel },
        { provide: getModelToken(Category.name), useValue: categoryModel },
        {
          provide: getModelToken(Transaction.name),
          useValue: transactionModel,
        },
        TransactionsService,
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  beforeEach(async () => {
    await mongoConnection.db.collection('transactions').deleteMany({});
    const banks = mongoConnection.db.collection('banks');
    const createdBank = await banks.insertOne({
      registerNumber: 'test1',
      name: 'test bank1',
      address: 'adrr1',
      balance: 100,
    });
    bankId = String(createdBank.insertedId);

    const categories = mongoConnection.db.collection('categories');
    const createdCategory = await categories.insertOne({
      name: 'test category1',
    });
    categoryId = String(createdCategory.insertedId);
  });

  afterAll(async () => {
    if (mongoConnection) {
      await mongoConnection.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return the saved object', async () => {
      const dto = new CreateTransactionDto({
        amount: 100,
        type: TransactionType.PROFITABLE,
        bankId: bankId,
        categoryIds: [categoryId],
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      const createdTransaction = await controller.create(dto);
      expect(createdTransaction).toMatchObject({
        amount: '100',
        type: TransactionType.PROFITABLE,
      });
    });

    it('should return validation error', async () => {
      const dto = new CreateTransactionDto({
        amount: -10,
        type: TransactionType.PROFITABLE,
        bankId: bankId,
        categoryIds: [categoryId],
      });
      const errors = await validate(dto);
      expect(errors.length).not.toBe(0);
      expect(stringified(errors)).toContain('amount must not be less than 0');
    });
  });

  describe('findAll', () => {
    it('should return return the an empty array', async () => {
      const list = await controller.findAll(1);
      expect(list).toEqual([]);
    });

    it('should get items without errors', async () => {
      const dto1 = new CreateTransactionDto({
        amount: 10,
        type: TransactionType.PROFITABLE,
        bankId: bankId,
        categoryIds: [categoryId],
      });
      const dto2 = new CreateTransactionDto({
        amount: 20,
        type: TransactionType.PROFITABLE,
        bankId: bankId,
        categoryIds: [categoryId],
      });
      await controller.create(dto1);
      await controller.create(dto2);
      const list = await controller.findAll();
      expect(list).toHaveLength(2);
    });
  });

  describe('remove', () => {
    it('should throw Exception on invalid id', async () => {
      await expect(controller.remove('non-existent-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should remove transaction', async () => {
      const col = mongoConnection.db.collection('transactions');
      const createdTransaction = await col.insertOne({
        amount: 10,
        type: TransactionType.PROFITABLE,
        bankId: bankId,
        categoryIds: [categoryId],
      });
      const result = await controller.remove(
        String(createdTransaction.insertedId),
      );

      expect(result).toBeUndefined();
    });
  });
});
