import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BanksModule } from './banks/banks.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoryModule } from './category/category.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { IsRelationshipProvider } from './common/is-relationship/is-realtionshop.decorator';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    BanksModule,
    TransactionsModule,
    CategoryModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            colorize: true,
            levelFirst: true,
            translateTime: 'yyyy-dd-mm, h:MM:ss TT',
            destination: 'storage/app.log',
          },
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, IsRelationshipProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
