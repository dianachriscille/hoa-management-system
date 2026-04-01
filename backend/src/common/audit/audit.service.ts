import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

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
  constructor(private dataSource: DataSource) {}

  async log(dto: AuditLogDto): Promise<void> {
    try {
      await this.dataSource.query(
        `INSERT INTO audit_log (id, user_id, action, entity_type, entity_id, ip_address, metadata, performed_at)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, now())`,
        [dto.userId || null, dto.action, dto.entityType, dto.entityId || null, dto.ipAddress || null, dto.metadata ? JSON.stringify(dto.metadata) : null],
      );
    } catch {
      // Audit log failures should never break the main flow
    }
  }
}
