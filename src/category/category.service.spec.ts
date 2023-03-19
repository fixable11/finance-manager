import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import mongoose, { Connection, connect, Model } from 'mongoose';
import { validate } from 'class-validator';
import { Category, CategorySchema } from './schemas/category.schema';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoryService', () => {
  let service: CategoryService;
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
      imports: [],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
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

  it('should call create method with expected params', async () => {
    const methodSpy = jest.spyOn(service, 'create');
    const dto = new CreateCategoryDto({ name: 'test' });
    await validate(dto);
    const { _id } = await service.create(dto);
    expect(methodSpy).toHaveBeenCalledWith(dto);
    const category = await service.findOne(_id);
    expect(category.name).toBe(dto.name);
  });

  it('should call findOne method', async () => {
    const spyService = jest.spyOn(service, 'findOne');
    const col = mongoConnection.db.collection('categories');
    let { insertedId }: any = await col.insertOne({ name: 'test' });
    insertedId = String(insertedId);
    const category = await service.findOne(insertedId);
    expect(spyService).toHaveBeenCalledWith(insertedId);
    expect(String(category._id)).toBe(insertedId);
  });

  it('should call findAll method', async () => {
    const spyService = jest.spyOn(service, 'findAll');
    const col = mongoConnection.db.collection('categories');
    const categories = [{ name: 'test' }, { name: 'test2' }];
    const result = await col.insertMany(categories);
    expect(result.insertedCount).toStrictEqual(2);
    expect(await col.countDocuments({})).toBe(2);
    const foundCategories = await service.findAll(1);
    expect(foundCategories).toMatchObject(categories);
    expect(spyService).toHaveBeenCalledWith(1);
  });

  it('should call update method', async () => {
    const spyService = jest.spyOn(service, 'update');
    const col = mongoConnection.db.collection('categories');
    let { insertedId }: any = await col.insertOne({ name: 'test' });
    insertedId = String(insertedId);
    const dto = new UpdateCategoryDto({ name: 'test2' });
    await service.update(insertedId, dto);
    expect(spyService).toHaveBeenCalledWith(insertedId, dto);
    const category = await service.findOne(insertedId);
    expect(category.name).toBe('test2');
  });

  it('should call remove method', async () => {
    const spyService = jest.spyOn(service, 'remove');
    const db = mongoConnection.db;
    expect(db).toBeDefined();
    const col = db.collection('categories');
    let { insertedId }: any = await col.insertOne({ name: 'test' });
    insertedId = String(insertedId);
    await service.remove(insertedId);
    expect(spyService).toHaveBeenCalledWith(insertedId);
    const foundBanks = await service.findAll();
    expect(foundBanks).toHaveLength(0);
  });
});
