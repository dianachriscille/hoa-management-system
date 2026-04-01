import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private ses: SESClient;
  private from: string;
  private logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {
    this.ses = new SESClient({ region: config.get('app.awsRegion') });
    this.from = config.get('app.awsSesFromEmail');
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const frontendUrl = this.config.get('app.frontendUrl');
    await this.send(to, 'Verify your HOA account', `Click to verify: ${frontendUrl}/verify-email?token=${token}`);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const frontendUrl = this.config.get('app.frontendUrl');
    await this.send(to, 'Reset your HOA password', `Click to reset: ${frontendUrl}/reset-password?token=${token}`);
  }

  private async send(to: string, subject: string, body: string): Promise<void> {
    try {
      await this.ses.send(new SendEmailCommand({
        Source: this.from,
        Destination: { ToAddresses: [to] },
        Message: { Subject: { Data: subject }, Body: { Text: { Data: body } } },
      }));
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }
}
