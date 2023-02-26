import { Module } from '@nestjs/common';
import { BanksService } from './banks.service';
import { BanksController } from './banks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Bank, BankSchema } from './schemas/bank.schema';
import { BankActions } from './actions/bank.actions';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  controllers: [BanksController],
  providers: [BanksService, BankActions],
  imports: [
    MongooseModule.forFeature([{ name: Bank.name, schema: BankSchema }]),
    TransactionsModule,
  ],
})
export class BanksModule {}
