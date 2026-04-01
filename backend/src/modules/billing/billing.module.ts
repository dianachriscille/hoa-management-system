import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { InvoiceEntity, PaymentEntity, ReceiptEntity } from './entities/billing.entities';
import { BillingConfigEntity } from './entities/billing-config.entity';
import { ResidentModule } from '../resident/resident.module';
import { NotificationModule } from '../notification/notification.module';
import { FileModule } from '../file/file.module';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoiceEntity, PaymentEntity, ReceiptEntity, BillingConfigEntity]),
    ResidentModule,
    NotificationModule,
    FileModule,
    AuditModule,
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
