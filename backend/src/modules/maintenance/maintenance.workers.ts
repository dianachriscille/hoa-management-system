import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceRequestEntity, MaintenanceStatus } from './entities/maintenance.entities';
import { MaintenanceGateway } from '../../common/websocket/maintenance.gateway';
import { EmailService } from '../notification/email.service';

@Processor('maintenance-auto-close')
export class MaintenanceAutoCloseWorker extends WorkerHost {
  private logger = new Logger(MaintenanceAutoCloseWorker.name);

  constructor(@InjectRepository(MaintenanceRequestEntity) private requestRepo: Repository<MaintenanceRequestEntity>) { super(); }

  async process(job: Job<{ requestId: string; userId?: string }>): Promise<void> {
    if (job.name === 'warn-before-close') {
      this.logger.log(`Sending 24h auto-close warning for request ${job.data.requestId}`);
      return;
    }
    const request = await this.requestRepo.findOne({ where: { id: job.data.requestId } });
    if (!request || request.status !== MaintenanceStatus.Resolved) return;
    request.status = MaintenanceStatus.Closed;
    request.closedAt = new Date();
    await this.requestRepo.save(request);
    this.logger.log(`Auto-closed request ${request.requestNumber}`);
  }
}

@Processor('maintenance-notifications')
export class MaintenanceNotificationWorker extends WorkerHost {
  constructor(
    private gateway: MaintenanceGateway,
    private emailService: EmailService,
    @InjectRepository(MaintenanceRequestEntity) private requestRepo: Repository<MaintenanceRequestEntity>,
  ) { super(); }

  async process(job: Job): Promise<void> {
    const { requestId, userId, newStatus } = job.data;
    const request = await this.requestRepo.findOne({ where: { id: requestId } });
    if (!request) return;

    if (job.name === 'notify-status-change' && userId) {
      this.gateway.broadcastStatusUpdate(userId, { requestId, requestNumber: request.requestNumber, newStatus });
    }
  }
}
