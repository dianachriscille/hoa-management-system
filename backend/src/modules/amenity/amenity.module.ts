import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AmenityService } from './amenity.service';
import { AmenityController } from './amenity.controller';
import { AmenityEntity, BookingEntity, BlockedDateEntity } from './entities/amenity.entities';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AmenityEntity, BookingEntity, BlockedDateEntity]),
    BullModule.registerQueue({ name: 'amenity-reminders' }),
    NotificationModule,
  ],
  controllers: [AmenityController],
  providers: [AmenityService],
  exports: [AmenityService],
})
export class AmenityModule {}
