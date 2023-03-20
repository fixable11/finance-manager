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
import { ApiProperty } from '@nestjs/swagger';

type TransactionBody = {
  amount: number;
  type: TransactionType;
  bankId: string;
  categoryIds: string[];
};

export class CreateTransactionDto {
  @ApiProperty({ minimum: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: TransactionType })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  @IsRelationShipWith(Bank)
  bankId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  @IsRelationShipWith(Category, { each: true })
  categoryIds: string[];

  /**
   * @param body
   */
  constructor(body: TransactionBody | null = null) {
    if (!body) return;

    this.amount = body.amount;
    this.type = body.type;
    this.bankId = body.bankId;
    this.categoryIds = body.categoryIds;
  }
}
