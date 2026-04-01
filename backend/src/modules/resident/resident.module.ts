import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResidentService } from './resident.service';
import { ResidentController } from './resident.controller';
import { ResidentProfileEntity } from './entities/resident-profile.entity';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResidentProfileEntity]),
    AuditModule,
  ],
  controllers: [ResidentController],
  providers: [ResidentService],
  exports: [ResidentService],
})
export class ResidentModule {}
