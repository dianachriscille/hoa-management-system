import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { customAlphabet } from 'nanoid';
import { VisitorPassEntity, IncidentReportEntity, IncidentCategory } from './entities/security.entities';
import { AuditService } from '../../common/audit/audit.service';
import { ResidentService } from '../resident/resident.service';
import { FileService } from '../file/file.service';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

@Injectable()
export class SecurityService {
  constructor(
    @InjectRepository(VisitorPassEntity) private passRepo: Repository<VisitorPassEntity>,
    @InjectRepository(IncidentReportEntity) private incidentRepo: Repository<IncidentReportEntity>,
    private config: ConfigService,
    private dataSource: DataSource,
    private auditService: AuditService,
    private residentService: ResidentService,
    private fileService: FileService,
  ) {}

  async createVisitorPass(userId: string, residentProfileId: string, visitorName: string, validDate: string): Promise<{ pass: VisitorPassEntity; qrDataUrl: string }> {
    const date = new Date(validDate);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (date < today) throw new BadRequestException('Valid date must be today or a future date');

    const profile = await this.residentService.getMyProfile(userId);
    const passCode = nanoid();
    const pass = await this.passRepo.save(this.passRepo.create({ passCode, userId, residentProfileId, visitorName, validDate: date }));

    const payload = { passCode, visitorName, validDate, unitNumber: (profile as any).unitNumber };
    const sig = crypto.createHmac('sha256', this.config.get('app.qrHmacSecret')).update(JSON.stringify(payload)).digest('hex');
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify({ ...payload, sig }));

    await this.auditService.log({ userId, action: 'VISITOR_PASS_CREATED', entityType: 'VisitorPass', entityId: pass.id });
    return { pass, qrDataUrl };
  }

  async getMyPasses(userId: string): Promise<VisitorPassEntity[]> {
    return this.passRepo.find({ where: { userId }, order: { validDate: 'DESC' } });
  }

  async revokePass(passId: string, userId: string): Promise<void> {
    const pass = await this.passRepo.findOne({ where: { id: passId, userId } });
    if (!pass) throw new NotFoundException('Pass not found');
    pass.isRevoked = true;
    await this.passRepo.save(pass);
  }

  async verifyPass(passCode: string, qrPayload?: string): Promise<{ valid: boolean; reason?: string; visitorName?: string; unitNumber?: string; validDate?: string }> {
    if (qrPayload) {
      try {
        const data = JSON.parse(qrPayload);
        const { sig, ...payload } = data;
        const expected = crypto.createHmac('sha256', this.config.get('app.qrHmacSecret')).update(JSON.stringify(payload)).digest('hex');
        if (sig !== expected) return { valid: false, reason: 'Invalid QR code signature' };
      } catch { return { valid: false, reason: 'Invalid QR code format' }; }
    }

    const pass = await this.passRepo.findOne({ where: { passCode } });
    if (!pass) return { valid: false, reason: 'Pass not found' };
    if (pass.isRevoked) return { valid: false, reason: 'Pass has been revoked' };

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const validDate = new Date(pass.validDate); validDate.setHours(0, 0, 0, 0);
    if (validDate < today) return { valid: false, reason: 'Pass has expired' };
    if (validDate > today) return { valid: false, reason: 'Pass is not yet valid' };

    const profile = await this.residentService.getMyProfile(pass.userId);
    return { valid: true, visitorName: pass.visitorName, unitNumber: (profile as any).unitNumber, validDate: pass.validDate.toString() };
  }

  async getTodayVisitors(): Promise<VisitorPassEntity[]> {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return this.passRepo.find({ where: { validDate: today as any, isRevoked: false } });
  }

  async lookupResident(unitNumber: string): Promise<any> {
    const profiles = await this.residentService.getDirectory(unitNumber);
    if (!profiles.data.length) throw new NotFoundException('No resident found for this unit number');
    const profile = profiles.data[0];
    const photoUrl = (profile as any).profilePhotoKey ? await this.fileService.generatePresignedDownloadUrl((profile as any).profilePhotoKey) : null;
    return { ...profile, profilePhotoUrl: photoUrl };
  }

  async createIncidentReport(userId: string, data: any): Promise<IncidentReportEntity> {
    const seq = await this.dataSource.query(`SELECT nextval('incident_report_seq') as seq`);
    const reportNumber = `INC-${new Date().getFullYear()}-${String(seq[0].seq).padStart(3, '0')}`;
    const report = await this.incidentRepo.save(this.incidentRepo.create({ ...data, reportedByUserId: userId, reportNumber }));
    await this.auditService.log({ userId, action: 'INCIDENT_REPORT_SUBMITTED', entityType: 'IncidentReport', entityId: report.id });
    return report;
  }

  async getMyIncidents(userId: string): Promise<IncidentReportEntity[]> {
    return this.incidentRepo.find({ where: { reportedByUserId: userId }, order: { createdAt: 'DESC' } });
  }

  async getAllIncidents(): Promise<IncidentReportEntity[]> {
    return this.incidentRepo.find({ order: { createdAt: 'DESC' } });
  }
}
