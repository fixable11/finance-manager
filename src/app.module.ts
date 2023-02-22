import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BanksModule } from './banks/banks.module';

@Module({
  imports: [BanksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
