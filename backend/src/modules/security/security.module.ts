import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { VisitorPassEntity, IncidentReportEntity } from './entities/security.entities';
import { ResidentModule } from '../resident/resident.module';
import { FileModule } from '../file/file.module';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VisitorPassEntity, IncidentReportEntity]),
    ResidentModule,
    FileModule,
    AuditModule,
  ],
  controllers: [SecurityController],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
