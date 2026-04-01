import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceRequestEntity, MaintenanceStatus } from './entities/maintenance.entities';
import { EmailService } from '../notification/email.service';

@Processor('maintenance-auto-close')
export class MaintenanceAutoCloseWorker extends WorkerHost {
  private logger = new Logger(MaintenanceAutoCloseWorker.name);

  constructor(@InjectRepository(MaintenanceRequestEntity) private requestRepo: Repository<MaintenanceRequestEntity>) { super(); }

  async process(job: Job<{ requestId: string; userId?: string }>): Promise<void> {
    if (job.name === 'warn-before-close') return;
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
  private logger = new Logger(MaintenanceNotificationWorker.name);

  constructor(
    private emailService: EmailService,
    @InjectRepository(MaintenanceRequestEntity) private requestRepo: Repository<MaintenanceRequestEntity>,
  ) { super(); }

  async process(job: Job): Promise<void> {
    const { requestId } = job.data;
    const request = await this.requestRepo.findOne({ where: { id: requestId } });
    if (!request) return;
    this.logger.log(`Notification job processed for request ${request.requestNumber}`);
  }
}
