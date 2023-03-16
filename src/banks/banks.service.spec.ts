import { Test, TestingModule } from '@nestjs/testing';
import { BanksService } from './banks.service';
import { getModelToken } from '@nestjs/mongoose';
import { Bank, BankSchema } from './schemas/bank.schema';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import mongoose, { Connection, connect, Model } from 'mongoose';
import { CreateBankDto } from './dto/create-bank.dto';
import { validate } from 'class-validator';
import { UpdateBankDto } from './dto/update-bank.dto';

describe('BanksService', () => {
  let service: BanksService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let bankModel: Model<Bank>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoose.set('strictQuery', false);
    const { connection } = await connect(uri);
    mongoConnection = connection;
    bankModel = mongoConnection.model(Bank.name, BankSchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: getModelToken(Bank.name), useValue: bankModel },
        BanksService,
      ],
      imports: [],
    }).compile();

    service = module.get<BanksService>(BanksService);
  });

  beforeEach(async () => {
    await mongoConnection.db.collection('banks').deleteMany({});
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
    expect(service).toBeDefined();
  });

  it('should call create method with expected params', async () => {
    const createNoteSpy = jest.spyOn(service, 'create');
    const dto = new CreateBankDto({
      name: 'test',
      registerNumber: 'test',
      address: 'test',
    });
    await validate(dto);
    const col = mongoConnection.db.collection('banks');
    let { insertedId }: any = await col.insertOne({
      registerNumber: 'test',
      name: 'test bank',
      address: 'adrr',
      balance: 100,
    });
    insertedId = String(insertedId);
    await service.create(dto);
    expect(createNoteSpy).toHaveBeenCalledWith(dto);
    const bank = await service.findOne(insertedId);
    expect(bank.registerNumber).toBe(dto.registerNumber);
  });

  it('should call findOne method', async () => {
    const spyService = jest.spyOn(service, 'findOne');
    const col = mongoConnection.db.collection('banks');
    let { insertedId }: any = await col.insertOne({
      registerNumber: 'test',
      name: 'test bank',
      address: 'adrr',
      balance: 100,
    });
    insertedId = String(insertedId);
    const bank = await service.findOne(insertedId);
    expect(spyService).toHaveBeenCalledWith(insertedId);
    expect(String(bank._id)).toBe(insertedId);
  });

  it('should call findAll method', async () => {
    const spyService = jest.spyOn(service, 'findAll');
    const db = mongoConnection.db;
    expect(db).toBeDefined();
    const col = db.collection('banks');
    const banks = [
      {
        registerNumber: 'test',
        name: 'test bank',
        address: 'adrr',
        balance: 100,
      },
      {
        registerNumber: 'test2',
        name: 'test bank2',
        address: 'adrr2',
        balance: 100,
      },
    ];
    const result = await col.insertMany(banks);
    expect(result.insertedCount).toStrictEqual(2);
    expect(await col.countDocuments({})).toBe(2);
    const foundBanks = await service.findAll(1);
    expect(foundBanks).toMatchObject(banks);
    expect(spyService).toHaveBeenCalledWith(1);
  });

  it('should call update method', async () => {
    const spyService = jest.spyOn(service, 'update');
    const col = mongoConnection.db.collection('banks');
    let { insertedId }: any = await col.insertOne({
      registerNumber: 'test',
      name: 'test bank',
      address: 'adrr',
      balance: 100,
    });
    insertedId = String(insertedId);
    const dto = new UpdateBankDto({ name: 'test bank new name' });
    await service.update(insertedId, dto);
    expect(spyService).toHaveBeenCalledWith(insertedId, dto);
    const bank = await service.findOne(insertedId);
    expect(bank.name).toBe('test bank new name');
  });

  it('should call remove method', async () => {
    const spyService = jest.spyOn(service, 'remove');
    const db = mongoConnection.db;
    expect(db).toBeDefined();
    const col = db.collection('banks');
    let { insertedId }: any = await col.insertOne({
      registerNumber: 'test',
      name: 'test bank',
      address: 'adrr',
      balance: 100,
    });
    insertedId = String(insertedId);
    await service.remove(insertedId);
    expect(spyService).toHaveBeenCalledWith(insertedId);
    const foundBanks = await service.findAll(1);
    expect(foundBanks).toHaveLength(0);
  });
});
