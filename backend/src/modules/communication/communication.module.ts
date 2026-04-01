import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunicationService } from './communication.service';
import { CommunicationController } from './communication.controller';
import { AnnouncementEntity, PollEntity, PollOptionEntity, PollVoteEntity, FeedbackFormEntity, EventEntity, DeviceTokenEntity } from './entities/communication.entities';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnnouncementEntity, PollEntity, PollOptionEntity, PollVoteEntity, FeedbackFormEntity, EventEntity, DeviceTokenEntity]),
    AuditModule,
  ],
  controllers: [CommunicationController],
  providers: [CommunicationService],
  exports: [CommunicationService],
})
export class CommunicationModule {}
