import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BanksService } from './banks.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { BankActions } from './actions/bank.actions';

@Controller('banks')
export class BanksController {
  constructor(
    private readonly banksService: BanksService,
    private readonly bankActions: BankActions,
  ) {}

  @Post()
  async create(@Body() createBankDto: CreateBankDto) {
    const bank = await this.banksService.create(createBankDto);

    return bank.toJson();
  }

  @Get()
  async findAll(@Query('page') page = 1) {
    const banks = await this.banksService.findAll(page);

    return banks.map((bank) => bank.toJson());
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const bank = await this.banksService.findOne(id);

    return bank.toJson();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBankDto: UpdateBankDto) {
    await this.banksService.update(id, updateBankDto);
    const bank = await this.banksService.findOne(id);

    return bank.toJson();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.bankActions.deleteBank(id);
  }
}
