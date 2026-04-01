import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export interface AuditLogDto {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  constructor(@InjectRepository('AuditLogEntity') private auditRepo: Repository<any>) {}

  async log(dto: AuditLogDto): Promise<void> {
    await this.auditRepo.save({ ...dto, performedAt: new Date() });
  }
}
