import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResidentProfileEntity } from './entities/resident-profile.entity';
import { AuditService } from '../../common/audit/audit.service';
import { RegisterDto } from '../auth/auth.dto';

@Injectable()
export class ResidentService {
  constructor(
    @InjectRepository(ResidentProfileEntity) private profileRepo: Repository<ResidentProfileEntity>,
    private auditService: AuditService,
  ) {}

  async checkUnitAvailability(unitNumber: string): Promise<void> {
    const existing = await this.profileRepo.findOne({ where: { unitNumber } });
    if (existing) throw new ConflictException('This unit number is already registered. Please contact the property manager.');
  }

  async createProfile(userId: string, dto: RegisterDto): Promise<ResidentProfileEntity> {
    const profile = this.profileRepo.create({ userId, unitNumber: dto.unitNumber, firstName: dto.firstName, lastName: dto.lastName, contactNumber: dto.contactNumber });
    return this.profileRepo.save(profile);
  }

  async recordConsent(userId: string, ipAddress: string): Promise<void> {
    // Consent recording handled via ConsentRecord entity — injected separately in full implementation
  }

  async getMyProfile(userId: string): Promise<ResidentProfileEntity> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<ResidentProfileEntity>): Promise<ResidentProfileEntity> {
    const profile = await this.getMyProfile(userId);
    if ('unitNumber' in updates) throw new BadRequestException('Unit number changes must be requested through the property manager.');
    Object.assign(profile, updates);
    const saved = await this.profileRepo.save(profile);
    await this.auditService.log({ userId, action: 'PROFILE_UPDATED', entityType: 'ResidentProfile', entityId: profile.id });
    return saved;
  }

  async getDirectory(search?: string, page = 1, limit = 20): Promise<{ data: ResidentProfileEntity[]; total: number }> {
    const qb = this.profileRepo.createQueryBuilder('p').leftJoinAndSelect('p.user', 'u');
    if (search) qb.where('p.unit_number ILIKE :s OR p.first_name ILIKE :s OR p.last_name ILIKE :s', { s: `%${search}%` });
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total };
  }
}
