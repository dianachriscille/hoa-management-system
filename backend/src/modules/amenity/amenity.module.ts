import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmenityService } from './amenity.service';
import { AmenityController } from './amenity.controller';
import { AmenityEntity, BookingEntity, BlockedDateEntity } from './entities/amenity.entities';
import { NotificationModule } from '../notification/notification.module';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AmenityEntity, BookingEntity, BlockedDateEntity]),
    NotificationModule,
    AuditModule,
  ],
  controllers: [AmenityController],
  providers: [AmenityService],
  exports: [AmenityService],
})
export class AmenityModule {}
