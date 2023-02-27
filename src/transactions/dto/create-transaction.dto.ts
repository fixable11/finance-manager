import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';
import { TransactionType } from '../schemas/transaction.schema';
import { Bank } from '../../banks/schemas/bank.schema';
import { IsRelationShipWith } from '../../common/is-relationship/is-realtionshop.decorator';
import { Category } from '../../category/schemas/category.schema';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: string;

  @IsNotEmpty()
  @IsMongoId()
  @IsRelationShipWith(Bank)
  bankId: string;

  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  @IsRelationShipWith(Category, { each: true })
  categoryIds: string[];
}
