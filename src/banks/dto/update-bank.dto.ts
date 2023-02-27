import { CreateBankDto } from './create-bank.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateBankDto extends PartialType(CreateBankDto) {}
