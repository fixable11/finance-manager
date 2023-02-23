import { Module } from '@nestjs/common';
import { BanksService } from './banks.service';
import { BanksController } from './banks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Bank, BankSchema } from './schemas/bank.schema';

@Module({
  controllers: [BanksController],
  providers: [BanksService],
  imports: [
    MongooseModule.forFeature([{ name: Bank.name, schema: BankSchema }]),
  ],
})
export class BanksModule {}
