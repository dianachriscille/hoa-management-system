import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceRequestEntity, StatusHistoryEntity, RequestPhotoEntity, RequestNoteEntity } from './entities/maintenance.entities';
import { FileModule } from '../file/file.module';
import { NotificationModule } from '../notification/notification.module';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MaintenanceRequestEntity, StatusHistoryEntity, RequestPhotoEntity, RequestNoteEntity]),
    FileModule,
    NotificationModule,
    AuditModule,
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
