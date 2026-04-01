import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { InvoiceEntity, PaymentEntity, ReceiptEntity } from './entities/billing.entities';
import { BillingConfigEntity } from './entities/billing-config.entity';
import { InvoiceGenerationWorker, OverdueReminderWorker, PendingPaymentCleanupWorker, ReceiptEmailWorker } from './billing.workers';
import { ResidentModule } from '../resident/resident.module';
import { NotificationModule } from '../notification/notification.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoiceEntity, PaymentEntity, ReceiptEntity, BillingConfigEntity]),
    BullModule.registerQueue(
      { name: 'invoice-generation' },
      { name: 'overdue-reminders' },
      { name: 'pending-payment-cleanup' },
      { name: 'receipt-email' },
    ),
    ResidentModule,
    NotificationModule,
    FileModule,
  ],
  controllers: [BillingController],
  providers: [BillingService, InvoiceGenerationWorker, OverdueReminderWorker, PendingPaymentCleanupWorker, ReceiptEmailWorker],
  exports: [BillingService],
})
export class BillingModule {}
