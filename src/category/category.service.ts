import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Model } from 'mongoose';

const LIST_LIMIT = 10;

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly category: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return await this.category.create(createCategoryDto);
  }

  async findAll(page = 1): Promise<Category[]> {
    const skip = (parseInt(`${page}`) - 1) * LIST_LIMIT;

    return await this.category.find({}).skip(skip).limit(LIST_LIMIT).exec();
  }

  async findOne(id: string): Promise<Category> {
    return await this.category.findOne({ _id: id }).exec();
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return await this.category
      .findOneAndUpdate({ _id: id }, updateCategoryDto)
      .exec();
  }

  async remove(id: string) {
    return await this.category.findByIdAndRemove(id).exec();
  }
}
