import { Test, TestingModule } from '@nestjs/testing';
import { BanksController } from './banks.controller';
import { BanksService } from './banks.service';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import mongoose, { connect, Connection, Model } from 'mongoose';
import { Bank, BankSchema } from './schemas/bank.schema';
import { getModelToken } from '@nestjs/mongoose';
import { TransactionsService } from '../transactions/transactions.service';
import {
  Transaction,
  TransactionSchema,
} from '../transactions/schemas/transaction.schema';
import { BankActions } from './actions/bank.actions';
import { validate } from 'class-validator';
import { stringified } from '../common/test/utils/test.until';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateCategoryDto } from '../category/dto/update-category.dto';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';

describe('BanksController', () => {
  let controller: BanksController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let bankModel: Model<Bank>;
  let transactionModel: Model<Transaction>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoose.set('strictQuery', false);
    mongoConnection = (await connect(uri)).connection;
    bankModel = mongoConnection.model(Bank.name, BankSchema);
    transactionModel = mongoConnection.model(
      Transaction.name,
      TransactionSchema,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: getModelToken(Bank.name), useValue: bankModel },
        {
          provide: getModelToken(Transaction.name),
          useValue: transactionModel,
        },
        BanksService,
        BankActions,
        TransactionsService,
      ],
      controllers: [BanksController],
      imports: [],
    }).compile();

    controller = module.get<BanksController>(BanksController);
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
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return the saved object', async () => {
      const dto = new CreateBankDto({
        name: 'test',
        address: 'test',
        registerNumber: '00000000',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      const createdBank = await controller.create(dto);
      expect(createdBank.registerNumber).toBe(dto.registerNumber);
    });

    it('should return validation error', async () => {
      const dto = new CreateBankDto({ name: '' });
      const errors = await validate(dto);
      expect(errors.length).not.toBe(0);
      expect(stringified(errors)).toContain(
        'name must be longer than or equal to 3 characters',
      );
      expect(stringified(errors)).toContain('name should not be empty');
    });
  });

  describe('findAll', () => {
    it('should return return the an empty array', async () => {
      const list = await controller.findAll(1);
      expect(list).toEqual([]);
    });

    it('should return items', async () => {
      const dto1 = new CreateBankDto({
        name: 'test',
        address: 'test1',
        registerNumber: '00000000',
      });
      const dto2 = new CreateBankDto({
        name: 'test2',
        address: 'test2',
        registerNumber: '00000001',
      });
      await controller.create(dto1);
      await controller.create(dto2);
      const list = await controller.findAll(1);
      expect(list).toHaveLength(2);
      expect(
        list.every((i) => ['00000000', '00000001'].includes(i.registerNumber)),
      ).toBeTruthy();
    });
  });

  describe('findOne', () => {
    it('should throw Exception on invalid id', async () => {
      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw Exception if entity was not found', async () => {
      await expect(
        controller.findOne('63f72d6580c903c806557458'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return the bank', async () => {
      const dto1 = new CreateBankDto({
        name: 'test',
        address: 'test1',
        registerNumber: '00000000',
      });
      const { _id } = await controller.create(dto1);
      const category = await controller.findOne(_id);
      expect(category.name).toBe(dto1.name);
    });
  });

  describe('update', () => {
    it('should throw Exception on invalid id', async () => {
      const updateDto = new UpdateBankDto({ name: 'updated name' });
      await expect(
        controller.update('non-existent-id', updateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw Exception if entity was not found', async () => {
      const updateDto = new UpdateBankDto({ name: 'updated name' });
      await expect(
        controller.update('63f72d6580c903c806557458', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update bank', async () => {
      const dto = new CreateBankDto({
        name: 'test',
        address: 'test1',
        registerNumber: '00000000',
      });
      const { _id } = await controller.create(dto);
      const updateDto = new UpdateCategoryDto({ name: 'updated name' });
      const category = await controller.update(_id, updateDto);
      expect(category.name).toBe(updateDto.name);
    });
  });

  describe('remove', () => {
    it('should throw Exception on invalid id', async () => {
      await expect(controller.remove('non-existent-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should remove bank', async () => {
      const dto = new CreateBankDto({
        name: 'test',
        address: 'test1',
        registerNumber: '00000000',
      });
      const { _id } = await controller.create(dto);
      await expect(controller.remove(_id)).resolves.toBeUndefined();
    });
  });
});
