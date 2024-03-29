import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    const transaction = await this.transactionsService.create(
      createTransactionDto,
    );

    return transaction.toJson();
  }

  @Get()
  async findAll(@Query('page') page = 1) {
    const transactions = await this.transactionsService.findAll(page);

    return transactions.map((transaction) => transaction.toJson());
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.transactionsService.remove(id);
  }
}
