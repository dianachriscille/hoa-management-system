import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private from: string;
  private logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {
    this.from = config.get('app.gmailFrom') || '';
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.get('app.gmailUser'),
        pass: config.get('app.gmailAppPassword'),
      },
    });
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const frontendUrl = this.config.get('app.frontendUrl');
    await this.send(to, 'Verify your HOA account',
      `<p>Click the link below to verify your account:</p><a href="${frontendUrl}/verify-email?token=${token}">Verify Email</a>`);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const frontendUrl = this.config.get('app.frontendUrl');
    await this.send(to, 'Reset your HOA password',
      `<p>Click the link below to reset your password:</p><a href="${frontendUrl}/reset-password?token=${token}">Reset Password</a>`);
  }

  async sendOverdueReminderEmail(userId: string, invoice: any): Promise<void> {
    await this.send(userId, 'HOA Dues Overdue Reminder',
      `<p>Your HOA dues for <strong>${invoice.billingPeriod}</strong> are overdue. Please settle your balance immediately.</p>`);
  }

  async sendReceiptEmail(userId: string, receiptId: string): Promise<void> {
    await this.send(userId, 'HOA Payment Receipt',
      `<p>Your payment has been confirmed. Receipt ID: <strong>${receiptId}</strong>. Thank you!</p>`);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }
}
