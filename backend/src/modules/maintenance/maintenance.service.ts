import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MaintenanceRequestEntity, StatusHistoryEntity, RequestPhotoEntity, RequestNoteEntity, MaintenanceStatus, MaintenanceCategory } from './entities/maintenance.entities';
import { CreateMaintenanceRequestDto, AssignRequestDto, UpdateStatusDto, AddNoteDto } from './maintenance.dto';
import { AuditService } from '../../common/audit/audit.service';
import { Role } from '../auth/auth.dto';

const VALID_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  [MaintenanceStatus.Submitted]:  [MaintenanceStatus.Assigned],
  [MaintenanceStatus.Assigned]:   [MaintenanceStatus.InProgress],
  [MaintenanceStatus.InProgress]: [MaintenanceStatus.Resolved],
  [MaintenanceStatus.Resolved]:   [MaintenanceStatus.Closed, MaintenanceStatus.Submitted],
  [MaintenanceStatus.Closed]:     [],
};

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceRequestEntity) private requestRepo: Repository<MaintenanceRequestEntity>,
    @InjectRepository(StatusHistoryEntity) private historyRepo: Repository<StatusHistoryEntity>,
    @InjectRepository(RequestPhotoEntity) private photoRepo: Repository<RequestPhotoEntity>,
    @InjectRepository(RequestNoteEntity) private noteRepo: Repository<RequestNoteEntity>,
    @InjectQueue('maintenance-auto-close') private autoCloseQueue: Queue,
    @InjectQueue('maintenance-notifications') private notifQueue: Queue,
    private dataSource: DataSource,
    private auditService: AuditService,
  ) {}

  async createRequest(userId: string, residentProfileId: string, dto: CreateMaintenanceRequestDto): Promise<MaintenanceRequestEntity> {
    if (dto.photoKeys && dto.photoKeys.length > 3) throw new BadRequestException('Maximum 3 photos allowed');

    const seq = await this.dataSource.query(`SELECT nextval('maintenance_request_seq') as seq`);
    const requestNumber = `MNT-${new Date().getFullYear()}-${String(seq[0].seq).padStart(3, '0')}`;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const request = await queryRunner.manager.save(MaintenanceRequestEntity,
        queryRunner.manager.create(MaintenanceRequestEntity, { requestNumber, userId, residentProfileId, category: dto.category, description: dto.description, location: dto.location })
      );
      if (dto.photoKeys?.length) {
        await queryRunner.manager.save(RequestPhotoEntity, dto.photoKeys.map(key => queryRunner.manager.create(RequestPhotoEntity, { requestId: request.id, s3Key: key, uploadedByUserId: userId })));
      }
      await queryRunner.manager.save(StatusHistoryEntity, queryRunner.manager.create(StatusHistoryEntity, { requestId: request.id, fromStatus: null, toStatus: MaintenanceStatus.Submitted, changedByUserId: userId }));
      await queryRunner.commitTransaction();
      await this.notifQueue.add('notify-pm-new-request', { requestId: request.id, requestNumber });
      await this.auditService.log({ userId, action: 'MAINTENANCE_REQUEST_SUBMITTED', entityType: 'MaintenanceRequest', entityId: request.id });
      return request;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getMyRequests(userId: string): Promise<MaintenanceRequestEntity[]> {
    return this.requestRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async getAllRequests(filters?: { status?: MaintenanceStatus; category?: MaintenanceCategory }): Promise<MaintenanceRequestEntity[]> {
    const qb = this.requestRepo.createQueryBuilder('r');
    if (filters?.status) qb.andWhere('r.status = :status', { status: filters.status });
    if (filters?.category) qb.andWhere('r.category = :category', { category: filters.category });
    return qb.orderBy('r.created_at', 'DESC').getMany();
  }

  async getRequest(id: string, userId: string, role: string): Promise<any> {
    const request = await this.requestRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Request not found');
    if (role === Role.Resident && request.userId !== userId) throw new ForbiddenException();

    const photos = await this.photoRepo.find({ where: { requestId: id } });
    const history = await this.historyRepo.find({ where: { requestId: id }, order: { createdAt: 'ASC' } });
    const allNotes = await this.noteRepo.find({ where: { requestId: id }, order: { createdAt: 'ASC' } });
    const notes = role === Role.Resident ? allNotes.filter(n => !n.isInternal) : allNotes;

    return { ...request, photos, statusHistory: history, notes };
  }

  async assignRequest(id: string, dto: AssignRequestDto, pmUserId: string): Promise<MaintenanceRequestEntity> {
    const request = await this.requestRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Request not found');
    if (![MaintenanceStatus.Submitted, MaintenanceStatus.Assigned].includes(request.status)) throw new BadRequestException('Request cannot be assigned in its current status');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const prev = request.status;
      request.status = MaintenanceStatus.Assigned;
      request.assignedToUserId = dto.assigneeUserId;
      request.assignedAt = new Date();
      await queryRunner.manager.save(request);
      await queryRunner.manager.save(StatusHistoryEntity, queryRunner.manager.create(StatusHistoryEntity, { requestId: id, fromStatus: prev, toStatus: MaintenanceStatus.Assigned, changedByUserId: pmUserId, note: dto.note }));
      await queryRunner.commitTransaction();
      await this.notifQueue.add('notify-assigned', { requestId: id, userId: request.userId, assigneeId: dto.assigneeUserId });
      await this.auditService.log({ userId: pmUserId, action: 'MAINTENANCE_REQUEST_ASSIGNED', entityType: 'MaintenanceRequest', entityId: id });
      return request;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: string, dto: UpdateStatusDto, userId: string, role: string): Promise<MaintenanceRequestEntity> {
    const request = await this.requestRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Request not found');

    const valid = VALID_TRANSITIONS[request.status];
    if (!valid.includes(dto.status)) throw new BadRequestException(`Invalid transition: ${request.status} → ${dto.status}`);

    const pmOnlyTransitions = [`${MaintenanceStatus.Submitted}→${MaintenanceStatus.Assigned}`, `${MaintenanceStatus.Assigned}→${MaintenanceStatus.InProgress}`, `${MaintenanceStatus.InProgress}→${MaintenanceStatus.Resolved}`];
    if (pmOnlyTransitions.includes(`${request.status}→${dto.status}`) && role !== Role.PropertyManager) throw new ForbiddenException();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const prev = request.status;
      request.status = dto.status;
      if (dto.status === MaintenanceStatus.Resolved) {
        request.resolvedAt = new Date();
        request.reopenDeadline = new Date(Date.now() + 7 * 24 * 3600 * 1000);
      }
      if (dto.status === MaintenanceStatus.Closed) request.closedAt = new Date();
      await queryRunner.manager.save(request);
      await queryRunner.manager.save(StatusHistoryEntity, queryRunner.manager.create(StatusHistoryEntity, { requestId: id, fromStatus: prev, toStatus: dto.status, changedByUserId: userId, note: dto.isInternal ? null : dto.note }));
      if (dto.note) await queryRunner.manager.save(RequestNoteEntity, queryRunner.manager.create(RequestNoteEntity, { requestId: id, authorUserId: userId, content: dto.note, isInternal: dto.isInternal ?? false }));
      await queryRunner.commitTransaction();

      if (dto.status === MaintenanceStatus.Resolved) {
        await this.autoCloseQueue.add('auto-close', { requestId: id }, { delay: 7 * 24 * 3600 * 1000 });
        await this.autoCloseQueue.add('warn-before-close', { requestId: id, userId: request.userId }, { delay: 6 * 24 * 3600 * 1000 });
      }
      await this.notifQueue.add('notify-status-change', { requestId: id, userId: request.userId, newStatus: dto.status });
      await this.auditService.log({ userId, action: 'MAINTENANCE_STATUS_UPDATED', entityType: 'MaintenanceRequest', entityId: id, metadata: { from: prev, to: dto.status } });
      return request;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmResolution(id: string, userId: string): Promise<MaintenanceRequestEntity> {
    const request = await this.requestRepo.findOne({ where: { id, userId } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== MaintenanceStatus.Resolved) throw new BadRequestException('Request is not in Resolved status');
    return this.updateStatus(id, { status: MaintenanceStatus.Closed }, userId, Role.Resident);
  }

  async reopenRequest(id: string, userId: string): Promise<MaintenanceRequestEntity> {
    const request = await this.requestRepo.findOne({ where: { id, userId } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== MaintenanceStatus.Resolved) throw new BadRequestException('Only Resolved requests can be reopened');
    if (request.reopenDeadline && new Date() > request.reopenDeadline) throw new BadRequestException('Reopen window has expired (7 days)');
    return this.updateStatus(id, { status: MaintenanceStatus.Submitted, note: 'Reopened by resident' }, userId, Role.Resident);
  }

  async addNote(id: string, dto: AddNoteDto, userId: string): Promise<RequestNoteEntity> {
    const request = await this.requestRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Request not found');
    return this.noteRepo.save(this.noteRepo.create({ requestId: id, authorUserId: userId, content: dto.content, isInternal: dto.isInternal ?? false }));
  }

  async getAnalytics(startDate: string, endDate: string): Promise<any> {
    const open = await this.requestRepo.count({ where: [{ status: MaintenanceStatus.Submitted }, { status: MaintenanceStatus.Assigned }, { status: MaintenanceStatus.InProgress }] } as any);
    const closed = await this.requestRepo.createQueryBuilder('r').where('r.status = :s', { s: MaintenanceStatus.Closed }).andWhere('r.closed_at BETWEEN :start AND :end', { start: startDate, end: endDate }).getCount();
    const avgResult = await this.dataSource.query(`SELECT AVG(EXTRACT(EPOCH FROM (closed_at - created_at))/86400) as avg_days FROM maintenance_request WHERE status = 'Closed' AND closed_at BETWEEN $1 AND $2`, [startDate, endDate]);
    const byCategory = await this.requestRepo.createQueryBuilder('r').select('r.category', 'category').addSelect('COUNT(*)', 'count').groupBy('r.category').getRawMany();
    return { open, closed, avgResolutionDays: parseFloat(avgResult[0]?.avg_days || '0').toFixed(1), byCategory };
  }
}
