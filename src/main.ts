import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = {};

        for (const err of validationErrors) {
          errors[err.property] = Object.values(err.constraints);
        }

        return new BadRequestException({
          messages: errors,
          error: 'Bad Request',
          statusCode: 400,
        });
      },
    }),
  );
  await app.listen(3000);
}
bootstrap();
