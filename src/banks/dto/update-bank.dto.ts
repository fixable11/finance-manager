import { CreateBankDto } from './create-bank.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateBankDto extends PartialType(CreateBankDto) {
  /**
   * @param body
   */
  constructor(body: any = {}) {
    super(body);
    this.name = body.name;
    this.registerNumber = body.registerNumber;
    this.address = body.address;
  }
}
