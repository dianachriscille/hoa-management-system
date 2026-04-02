import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { MaintenanceRequestEntity, MaintenanceStatus } from './entities/maintenance.entities';

@Injectable()
export class MaintenanceScheduler {
  private logger = new Logger(MaintenanceScheduler.name);

  constructor(
    @InjectRepository(MaintenanceRequestEntity) private requestRepo: Repository<MaintenanceRequestEntity>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async autoCloseResolvedRequests() {
    const cutoff = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const resolved = await this.requestRepo.find({
      where: { status: MaintenanceStatus.Resolved, resolvedAt: LessThan(cutoff) },
    });

    for (const request of resolved) {
      request.status = MaintenanceStatus.Closed;
      request.closedAt = new Date();
      await this.requestRepo.save(request);
      this.logger.log(`Auto-closed request ${request.requestNumber}`);
    }
  }
}
