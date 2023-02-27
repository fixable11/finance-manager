import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger(`HTTP`);
  use(req: Request, res: Response, next: NextFunction) {
    if (process.env.ENABLE_HTTP_LOG) {
      this.logger.log(
        `Logging HTTP request ${req.method} ${req.url} ${res.statusCode}`,
        req.body,
      );
    }
    next();
  }
}
