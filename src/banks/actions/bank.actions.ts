import { BanksService } from '../banks.service';
import { TransactionsService } from '../../transactions/transactions.service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class BankActions {
  constructor(
    private readonly banksService: BanksService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async deleteBank(bankId: string) {
    if (await this.transactionsService.transactionExists(bankId)) {
      throw new BadRequestException(
        "It's forbidden to delete bank if at least one transaction exists",
      );
    }

    await this.banksService.remove(bankId);
  }
}
