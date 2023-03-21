import { CategoryController } from './category.controller';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Connection, connect, Model } from 'mongoose';
import { validate } from 'class-validator';
import { Category, CategorySchema } from './schemas/category.schema';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { stringified } from '../common/test/utils/test.until';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoryController', () => {
  let controller: CategoryController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let categoryModel: Model<Category>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoose.set('strictQuery', false);
    const { connection } = await connect(uri);
    mongoConnection = connection;
    categoryModel = mongoConnection.model(Category.name, CategorySchema);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: getModelToken(Category.name), useValue: categoryModel },
        CategoryService,
      ],
      controllers: [CategoryController],
      imports: [],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  beforeEach(async () => {
    await mongoConnection.db.collection('categories').deleteMany({});
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
      const dto = new CreateCategoryDto({ name: 'test' });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      const createdCategory = await controller.create(dto);
      expect(createdCategory.name).toBe(dto.name);
    });

    it('should return validation error', async () => {
      const dto = new CreateCategoryDto({ name: '' });
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

    it('should return validation error', async () => {
      const dto1 = new CreateCategoryDto({ name: 'test' });
      const dto2 = new CreateCategoryDto({ name: 'test2' });
      await controller.create(dto1);
      await controller.create(dto2);
      const list = await controller.findAll(1);
      expect(list).toHaveLength(2);
      expect(
        list.every((i) => ['test', 'test2'].includes(i.name)),
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

    it('should return the category', async () => {
      const dto1 = new CreateCategoryDto({ name: 'test' });
      const { _id } = await controller.create(dto1);
      const category = await controller.findOne(_id);
      expect(category.name).toBe(dto1.name);
    });
  });

  describe('update', () => {
    it('should throw Exception on invalid id', async () => {
      const updateDto = new UpdateCategoryDto({ name: 'updated name' });
      await expect(
        controller.update('non-existent-id', updateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw Exception if entity was not found', async () => {
      const updateDto = new UpdateCategoryDto({ name: 'updated name' });
      await expect(
        controller.update('63f72d6580c903c806557458', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update category', async () => {
      const dto = new CreateCategoryDto({ name: 'test' });
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

    it('should remove category', async () => {
      const dto = new CreateCategoryDto({ name: 'test' });
      const { _id } = await controller.create(dto);
      await expect(controller.remove(_id)).resolves.toBeUndefined();
    });
  });
});
