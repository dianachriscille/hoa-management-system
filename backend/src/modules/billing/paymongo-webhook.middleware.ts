import { Injectable, NestMiddleware, BadRequestException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymongoWebhookMiddleware implements NestMiddleware {
  private logger = new Logger(PaymongoWebhookMiddleware.name);

  constructor(private config: ConfigService) {}

  use(req: Request & { rawBody?: Buffer }, res: Response, next: NextFunction) {
    const signature = req.headers['paymongo-signature'] as string;
    const secret = this.config.get<string>('app.paymongoWebhookSecret');
    const rawBody = req.rawBody;

    if (!signature || !rawBody) {
      this.logger.warn('PayMongo webhook received without signature or body');
      throw new BadRequestException('Invalid webhook request');
    }

    // PayMongo signature format: t=timestamp,te=test_sig,li=live_sig
    const parts = signature.split(',').reduce((acc, part) => {
      const [key, value] = part.split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const timestamp = parts['t'];
    const sigToVerify = parts['li'] || parts['te']; // live or test signature

    const computedSig = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${rawBody.toString()}`)
      .digest('hex');

    if (sigToVerify !== computedSig) {
      this.logger.warn('PayMongo webhook signature mismatch');
      throw new BadRequestException('Invalid webhook signature');
    }

    next();
  }
}
