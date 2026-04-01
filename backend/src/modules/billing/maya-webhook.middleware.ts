import { Injectable, NestMiddleware, BadRequestException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MayaWebhookMiddleware implements NestMiddleware {
  private logger = new Logger(MayaWebhookMiddleware.name);

  constructor(private config: ConfigService) {}

  use(req: Request & { rawBody?: Buffer }, res: Response, next: NextFunction) {
    const signature = req.headers['x-callback-signature'] as string;
    const secret = this.config.get<string>('app.mayaWebhookSecret');
    const rawBody = req.rawBody;

    if (!signature || !rawBody) {
      this.logger.warn('Maya webhook received without signature or body');
      throw new BadRequestException('Invalid webhook request');
    }

    const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (signature !== computed) {
      this.logger.warn('Maya webhook signature mismatch');
      throw new BadRequestException('Invalid webhook signature');
    }

    next();
  }
}
