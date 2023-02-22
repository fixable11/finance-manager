import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BanksModule } from './banks/banks.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoryModule } from './category/category.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [BanksModule, TransactionsModule, CategoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
