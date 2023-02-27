import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request>();
    this.logger.error({
      class: exception.name,
      msg: exception.message,
      body: request.body,
      headers: request.headers,
    });

    super.catch(exception, host);
  }
}
