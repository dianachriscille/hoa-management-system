import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CommunicationService } from './communication.service';
import { CommunicationController } from './communication.controller';
import { AnnouncementEntity, PollEntity, PollOptionEntity, PollVoteEntity, FeedbackFormEntity, EventEntity, DeviceTokenEntity } from './entities/communication.entities';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnnouncementEntity, PollEntity, PollOptionEntity, PollVoteEntity, FeedbackFormEntity, EventEntity, DeviceTokenEntity]),
    BullModule.registerQueue(
      { name: 'communication-push' },
      { name: 'poll-auto-close' },
    ),
    AuditModule,
  ],
  controllers: [CommunicationController],
  providers: [CommunicationService],
  exports: [CommunicationService],
})
export class CommunicationModule {}
