import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { InvoiceEntity, InvoiceStatus, PaymentEntity, PaymentStatus } from './entities/billing.entities';
import { BillingService } from './billing.service';
import { EmailService } from '../notification/email.service';

@Injectable()
export class BillingScheduler {
  private logger = new Logger(BillingScheduler.name);

  constructor(
    @InjectRepository(InvoiceEntity) private invoiceRepo: Repository<InvoiceEntity>,
    @InjectRepository(PaymentEntity) private paymentRepo: Repository<PaymentEntity>,
    private billingService: BillingService,
    private emailService: EmailService,
  ) {}

  @Cron('0 8 1 * *') // 1st of every month at 8am
  async generateMonthlyInvoices() {
    const now = new Date();
    const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.logger.log(`Auto-generating invoices for ${billingPeriod}`);
    const result = await this.billingService.generateInvoices(billingPeriod, 'system');
    this.logger.log(`Generated: ${result.generated}, Skipped: ${result.skipped}`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async processOverdueInvoices() {
    const today = new Date();
    const overdueInvoices = await this.invoiceRepo.find({
      where: [
        { status: InvoiceStatus.Unpaid, dueDate: LessThan(today) },
        { status: InvoiceStatus.PartiallyPaid, dueDate: LessThan(today) },
      ],
    });

    for (const invoice of overdueInvoices) {
      if (invoice.status !== InvoiceStatus.Overdue) invoice.status = InvoiceStatus.Overdue;
      const daysSinceReminder = invoice.lastReminderSentAt
        ? Math.floor((today.getTime() - invoice.lastReminderSentAt.getTime()) / 86400000)
        : 999;
      const daysOverdue = Math.floor((today.getTime() - new Date(invoice.dueDate).getTime()) / 86400000);

      if (daysOverdue >= 7 && daysSinceReminder >= 7) {
        await this.emailService.sendOverdueReminderEmail(invoice.userId, invoice);
        invoice.lastReminderSentAt = today;
        invoice.reminderCount++;
      }
      await this.invoiceRepo.save(invoice);
    }
    this.logger.log(`Processed ${overdueInvoices.length} overdue invoices`);
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async cleanupPendingPayments() {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    await this.paymentRepo.update(
      { status: PaymentStatus.Pending, createdAt: LessThan(cutoff) } as any,
      { status: PaymentStatus.Failed },
    );
  }
}
