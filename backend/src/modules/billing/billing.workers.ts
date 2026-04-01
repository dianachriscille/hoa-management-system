import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { InvoiceEntity, InvoiceStatus, PaymentEntity, PaymentStatus } from './entities/billing.entities';
import { BillingService } from './billing.service';
import { EmailService } from '../notification/email.service';

@Processor('invoice-generation')
export class InvoiceGenerationWorker extends WorkerHost {
  private logger = new Logger(InvoiceGenerationWorker.name);

  constructor(private billingService: BillingService) { super(); }

  async process(job: Job): Promise<void> {
    const now = new Date();
    const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.logger.log(`Auto-generating invoices for ${billingPeriod}`);
    const result = await this.billingService.generateInvoices(billingPeriod, 'system');
    this.logger.log(`Generated: ${result.generated}, Skipped: ${result.skipped}`);
  }
}

@Processor('overdue-reminders')
export class OverdueReminderWorker extends WorkerHost {
  private logger = new Logger(OverdueReminderWorker.name);

  constructor(
    @InjectRepository(InvoiceEntity) private invoiceRepo: Repository<InvoiceEntity>,
    private emailService: EmailService,
  ) { super(); }

  async process(job: Job): Promise<void> {
    const today = new Date();
    const overdueInvoices = await this.invoiceRepo.find({
      where: [{ status: InvoiceStatus.Unpaid, dueDate: LessThan(today) }, { status: InvoiceStatus.PartiallyPaid, dueDate: LessThan(today) }],
    });

    for (const invoice of overdueInvoices) {
      if (invoice.status !== InvoiceStatus.Overdue) {
        invoice.status = InvoiceStatus.Overdue;
      }
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
}

@Processor('pending-payment-cleanup')
export class PendingPaymentCleanupWorker extends WorkerHost {
  constructor(@InjectRepository(PaymentEntity) private paymentRepo: Repository<PaymentEntity>) { super(); }

  async process(job: Job): Promise<void> {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    await this.paymentRepo.update(
      { status: PaymentStatus.Pending, createdAt: LessThan(cutoff) } as any,
      { status: PaymentStatus.Failed },
    );
  }
}

@Processor('receipt-email')
export class ReceiptEmailWorker extends WorkerHost {
  constructor(private emailService: EmailService) { super(); }

  async process(job: Job<{ receiptId: string; userId: string }>): Promise<void> {
    await this.emailService.sendReceiptEmail(job.data.userId, job.data.receiptId);
  }
}
