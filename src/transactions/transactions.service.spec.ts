import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import mongoose, { connect, Connection, Model, ObjectId } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { validate } from 'class-validator';
import {
  Transaction,
  TransactionSchema,
  TransactionType,
} from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Bank, BankSchema } from '../banks/schemas/bank.schema';
import { Category, CategorySchema } from '../category/schemas/category.schema';

describe('TransactionsService', () => {
  let service: TransactionsService;
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
    const bankModel = mongoConnection.model(Bank.name, BankSchema);
    const categoryModel = mongoConnection.model(Category.name, CategorySchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: getModelToken(Bank.name), useValue: bankModel },
        { provide: getModelToken(Category.name), useValue: categoryModel },
        {
          provide: getModelToken(Transaction.name),
          useValue: transactionModel,
        },
        TransactionsService,
      ],
      imports: [],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  beforeEach(async () => {
    await mongoConnection.db.collection('transactions').deleteMany({});
    const banks = mongoConnection.db.collection('banks');
    const createdBank = await banks.insertOne({
      registerNumber: 'test',
      name: 'test bank',
      address: 'adrr',
      balance: 100,
    });
    bankId = String(createdBank.insertedId);

    const categories = mongoConnection.db.collection('categories');
    const createdCategory = await categories.insertOne({
      name: 'test category',
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

  it('should call create method with expected params', async () => {
    const methodSpy = jest.spyOn(service, 'create');
    const dto = new CreateTransactionDto({
      amount: 100,
      type: TransactionType.PROFITABLE,
      bankId: bankId,
      categoryIds: [categoryId],
    });
    await validate(dto);
    const { _id } = await service.create(dto);
    expect(methodSpy).toHaveBeenCalledWith(dto);
    const col = mongoConnection.db.collection('transactions');
    const record = await col.findOne({ _id });
    expect({
      amount: dto.amount,
      type: dto.type,
      bankId: dto.bankId,
      categoryIds: dto.categoryIds,
    }).toStrictEqual({
      amount: +record.amount,
      type: record.type,
      bankId: String(record.bank),
      categoryIds: record.categories.map((i) => String(i)),
    });
  });

  it('should call findAll method', async () => {
    const spyService = jest.spyOn(service, 'findAll');
    const col = mongoConnection.db.collection('transactions');
    const transactions = [
      {
        amount: '100',
        type: TransactionType.PROFITABLE,
        bankId: bankId,
        categoryIds: [categoryId],
      },
      {
        amount: '20',
        type: TransactionType.CONSUMABLE,
        bankId: bankId,
        categoryIds: [categoryId],
      },
    ];
    const result = await col.insertMany(transactions);
    expect(result.insertedCount).toStrictEqual(2);
    const insertedIds = Object.values(result.insertedIds);
    expect(await col.countDocuments({})).toBe(2);
    const foundTransactions = await service.findAll(1);
    expect(
      foundTransactions.every((i) =>
        insertedIds.map((i) => String(i)).includes(String(i._id)),
      ),
    ).toBeTruthy();
    expect(spyService).toHaveBeenCalledWith(1);
  });

  it('should call update method', async () => {
    const spyService = jest.spyOn(service, 'transactionExists');
    const col = mongoConnection.db.collection('transactions');
    await col.insertOne({
      amount: '100',
      type: TransactionType.PROFITABLE,
      bankId: bankId,
      categoryIds: [categoryId],
    });
    expect(await service.transactionExists(bankId)).toBeTruthy();
    expect(spyService).toHaveBeenCalledWith(bankId);
  });

  it('should call remove method', async () => {
    const spyService = jest.spyOn(service, 'remove');
    const col = mongoConnection.db.collection('transactions');
    const { insertedId } = await col.insertOne({
      amount: '100',
      type: TransactionType.PROFITABLE,
      bankId: bankId,
      categoryIds: [categoryId],
    });
    const foundTransactions = await service.findAll(1);
    expect(foundTransactions).toHaveLength(1);
    await service.remove(String(insertedId));
    expect(await service.findAll(1)).toHaveLength(0);
    expect(spyService).toHaveBeenCalledWith(String(insertedId));
  });
});
