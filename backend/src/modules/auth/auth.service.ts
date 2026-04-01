import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { UserEntity } from './entities/user.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { RegisterDto, LoginDto, AuthTokensDto, Role } from './auth.dto';
import { AuditService } from '../../common/audit/audit.service';
import { EmailService } from '../notification/email.service';
import { ResidentService } from '../resident/resident.service';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TTL_SECONDS = 900;
const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService implements OnModuleInit {
  private redis: Redis;

  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity) private tokenRepo: Repository<RefreshTokenEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
    private emailService: EmailService,
    private residentService: ResidentService,
  ) {}

  onModuleInit() {
    try {
      const redisUrl = process.env.REDIS_URL || this.configService.get<string>('app.redisUrl') || 'redis://localhost:6379';
      const isTls = redisUrl.startsWith('rediss://');
      this.redis = new Redis(redisUrl, {
        tls: isTls ? { rejectUnauthorized: false } : undefined,
        lazyConnect: true,
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
      });
      this.redis.connect().catch(() => null);
    } catch {
      // Redis unavailable — auth will work without session cache
    }
  }

  async register(dto: RegisterDto, ipAddress: string): Promise<void> {
    if (!dto.consentGiven) throw new BadRequestException('Consent is required');
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');
    await this.residentService.checkUnitAvailability(dto.unitNumber);
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const emailVerificationToken = uuidv4();
    const user = this.userRepo.create({ email: dto.email, passwordHash, role: Role.Resident, emailVerificationToken });
    await this.userRepo.save(user);
    await this.residentService.createProfile(user.id, dto);
    await this.residentService.recordConsent(user.id, ipAddress);
    await this.auditService.log({ userId: user.id, action: 'USER_REGISTERED', entityType: 'User', entityId: user.id, ipAddress });
    await this.emailService.sendVerificationEmail(dto.email, emailVerificationToken);
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { emailVerificationToken: token } });
    if (!user) throw new BadRequestException('Invalid or expired verification link');
    const tokenAge = Date.now() - user.createdAt.getTime();
    if (tokenAge > 24 * 60 * 60 * 1000) throw new BadRequestException('Verification link expired');
    user.isEmailVerified = true;
    user.emailVerificationToken = null as any;
    await this.userRepo.save(user);
    await this.auditService.log({ userId: user.id, action: 'EMAIL_VERIFIED', entityType: 'User', entityId: user.id });
  }

  async login(dto: LoginDto, ipAddress: string): Promise<AuthTokensDto> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new ForbiddenException('Account is deactivated');
    if (!user.isEmailVerified) throw new ForbiddenException('Please verify your email before logging in');

    const lockKey = `login_lock:${user.id}`;
    const locked = await this.redis.get(lockKey).catch(() => null);
    if (locked) throw new UnauthorizedException('Too many failed attempts. Try again in 15 minutes.');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      const attemptsKey = `login_attempts:${user.id}`;
      const attempts = await this.redis.incr(attemptsKey).catch(() => 1);
      await this.redis.expire(attemptsKey, LOCK_TTL_SECONDS).catch(() => null);
      if (attempts >= MAX_LOGIN_ATTEMPTS) await this.redis.set(lockKey, '1', 'EX', LOCK_TTL_SECONDS).catch(() => null);
      await this.auditService.log({ userId: user.id, action: 'LOGIN_FAILED', entityType: 'User', entityId: user.id, ipAddress });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.redis.del(`login_attempts:${user.id}`).catch(() => null);
    const tokens = await this.issueTokens(user);
    await this.redis.set(`session:${user.id}`, JSON.stringify({ role: user.role, email: user.email }), 'EX', 7 * 24 * 3600).catch(() => null);
    await this.auditService.log({ userId: user.id, action: 'USER_LOGIN', entityType: 'User', entityId: user.id, ipAddress });
    return tokens;
  }

  async refreshToken(rawToken: string): Promise<AuthTokensDto> {
    const records = await this.tokenRepo.find({ where: { isRevoked: false } });
    let found: RefreshTokenEntity | null = null;
    for (const r of records) {
      if (!r.isRevoked && r.expiresAt > new Date() && await bcrypt.compare(rawToken, r.tokenHash)) { found = r; break; }
    }
    if (!found) throw new UnauthorizedException('Invalid refresh token');
    found.isRevoked = true;
    await this.tokenRepo.save(found);
    const user = await this.userRepo.findOne({ where: { id: found.userId } });
    return this.issueTokens(user!);
  }

  async logout(userId: string, rawToken: string): Promise<void> {
    const records = await this.tokenRepo.find({ where: { userId, isRevoked: false } });
    for (const r of records) {
      if (await bcrypt.compare(rawToken, r.tokenHash)) { r.isRevoked = true; await this.tokenRepo.save(r); break; }
    }
    await this.redis.del(`session:${userId}`).catch(() => null);
    await this.auditService.log({ userId, action: 'USER_LOGOUT', entityType: 'User', entityId: userId });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return;
    user.passwordResetToken = uuidv4();
    user.passwordResetExpiresAt = new Date(Date.now() + 3600 * 1000);
    await this.userRepo.save(user);
    await this.emailService.sendPasswordResetEmail(email, user.passwordResetToken);
    await this.auditService.log({ userId: user.id, action: 'PASSWORD_RESET_REQUESTED', entityType: 'User', entityId: user.id });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { passwordResetToken: token } });
    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) throw new BadRequestException('Invalid or expired reset link');
    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.passwordResetToken = null as any;
    user.passwordResetExpiresAt = null as any;
    await this.userRepo.save(user);
    await this.tokenRepo.update({ userId: user.id }, { isRevoked: true });
    await this.redis.del(`session:${user.id}`).catch(() => null);
    await this.auditService.log({ userId: user.id, action: 'PASSWORD_RESET_COMPLETED', entityType: 'User', entityId: user.id });
  }

  private async issueTokens(user: UserEntity): Promise<AuthTokensDto> {
    const payload = { sub: user.id, role: user.role, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const rawRefresh = uuidv4();
    const tokenHash = await bcrypt.hash(rawRefresh, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    await this.tokenRepo.save(this.tokenRepo.create({ userId: user.id, tokenHash, expiresAt }));
    return { accessToken, refreshToken: rawRefresh };
  }
}
