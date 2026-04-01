import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceRequestEntity, StatusHistoryEntity, RequestPhotoEntity, RequestNoteEntity } from './entities/maintenance.entities';
import { MaintenanceAutoCloseWorker, MaintenanceNotificationWorker } from './maintenance.workers';
import { FileModule } from '../file/file.module';
import { NotificationModule } from '../notification/notification.module';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MaintenanceRequestEntity, StatusHistoryEntity, RequestPhotoEntity, RequestNoteEntity]),
    BullModule.registerQueue(
      { name: 'maintenance-auto-close' },
      { name: 'maintenance-notifications' },
    ),
    FileModule,
    NotificationModule,
    AuditModule,
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService, MaintenanceAutoCloseWorker, MaintenanceNotificationWorker],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
