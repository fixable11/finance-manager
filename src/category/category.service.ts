import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Model, Types } from 'mongoose';
import { validateId } from '../common/validation/entity.validation';

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
    validateId(id);

    const category: Category | null = await this.category
      .findOne({ _id: id })
      .exec();

    if (!category) {
      throw new NotFoundException('Category was not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    validateId(id);

    return await this.category
      .findOneAndUpdate({ _id: id }, updateCategoryDto)
      .exec();
  }

  async remove(id: string) {
    validateId(id);

    return await this.category.findByIdAndRemove(id).exec();
  }
}
