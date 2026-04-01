import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AnnouncementEntity, AnnouncementStatus, PollEntity, PollStatus, PollOptionEntity, PollVoteEntity, FeedbackFormEntity, EventEntity, DeviceTokenEntity, RsvpStatus } from './entities/communication.entities';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class CommunicationService {
  constructor(
    @InjectRepository(AnnouncementEntity) private announcementRepo: Repository<AnnouncementEntity>,
    @InjectRepository(PollEntity) private pollRepo: Repository<PollEntity>,
    @InjectRepository(PollOptionEntity) private optionRepo: Repository<PollOptionEntity>,
    @InjectRepository(PollVoteEntity) private voteRepo: Repository<PollVoteEntity>,
    @InjectRepository(FeedbackFormEntity) private formRepo: Repository<FeedbackFormEntity>,
    @InjectRepository(EventEntity) private eventRepo: Repository<EventEntity>,
    @InjectRepository(DeviceTokenEntity) private tokenRepo: Repository<DeviceTokenEntity>,
    private dataSource: DataSource,
    private auditService: AuditService,
  ) {}

  async createAnnouncement(userId: string, title: string, body: string, sendPush: boolean): Promise<AnnouncementEntity> {
    const ann = await this.announcementRepo.save(this.announcementRepo.create({ title, body, sendPush, sendSms: false, status: AnnouncementStatus.Published, publishedAt: new Date(), createdByUserId: userId }));
    await this.auditService.log({ userId, action: 'ANNOUNCEMENT_PUBLISHED', entityType: 'Announcement', entityId: ann.id });
    return ann;
  }

  async getAnnouncements(): Promise<AnnouncementEntity[]> {
    return this.announcementRepo.find({ where: { status: AnnouncementStatus.Published }, order: { publishedAt: 'DESC' } });
  }

  async markAnnouncementRead(announcementId: string, userId: string): Promise<void> {
    await this.dataSource.query(`INSERT INTO announcement_read (id, announcement_id, user_id) VALUES (uuid_generate_v4(), $1, $2) ON CONFLICT DO NOTHING`, [announcementId, userId]);
  }

  async createPoll(userId: string, question: string, options: string[], closingDate: string): Promise<PollEntity> {
    if (options.length < 2) throw new BadRequestException('Poll must have at least 2 options');
    const poll = await this.pollRepo.save(this.pollRepo.create({ question, closingDate: new Date(closingDate), createdByUserId: userId }));
    await this.optionRepo.save(options.map((text, i) => this.optionRepo.create({ pollId: poll.id, optionText: text, displayOrder: i + 1 })));
    return poll;
  }

  async getPolls(userId: string): Promise<any[]> {
    const polls = await this.pollRepo.find({ order: { createdAt: 'DESC' } });
    return Promise.all(polls.map(async p => {
      const options = await this.optionRepo.find({ where: { pollId: p.id }, order: { displayOrder: 'ASC' } });
      const userVote = await this.voteRepo.findOne({ where: { pollId: p.id, userId } });
      const showResults = p.status === PollStatus.Closed || !!userVote;
      const optionsWithCounts = await Promise.all(options.map(async o => ({ ...o, voteCount: showResults ? await this.voteRepo.count({ where: { optionId: o.id } }) : null })));
      return { ...p, options: optionsWithCounts, hasVoted: !!userVote, userVoteOptionId: userVote?.optionId };
    }));
  }

  async submitVote(pollId: string, optionId: string, userId: string): Promise<void> {
    const poll = await this.pollRepo.findOne({ where: { id: pollId } });
    if (!poll) throw new NotFoundException('Poll not found');
    if (poll.status === PollStatus.Closed) throw new BadRequestException('Poll is closed');
    if (new Date() > new Date(poll.closingDate)) throw new BadRequestException('Poll has expired');
    const existing = await this.voteRepo.findOne({ where: { pollId, userId } });
    if (existing) throw new BadRequestException('You have already voted in this poll');
    await this.voteRepo.save(this.voteRepo.create({ pollId, optionId, userId }));
  }

  async getForms(): Promise<FeedbackFormEntity[]> {
    return this.formRepo.find({ where: { isActive: true }, order: { createdAt: 'DESC' } });
  }

  async submitFeedback(formId: string, userId: string, answers: any[]): Promise<void> {
    const form = await this.formRepo.findOne({ where: { id: formId, isActive: true } });
    if (!form) throw new NotFoundException('Form not found');
    const existing = await this.dataSource.query(`SELECT id FROM feedback_response WHERE form_id = $1 AND user_id = $2`, [formId, userId]);
    if (existing.length) throw new BadRequestException('You have already submitted this form');
    await this.dataSource.query(`INSERT INTO feedback_response (id, form_id, user_id, answers) VALUES (uuid_generate_v4(), $1, $2, $3)`, [formId, userId, JSON.stringify(answers)]);
  }

  async createEvent(userId: string, data: any): Promise<EventEntity> {
    return this.eventRepo.save(this.eventRepo.create({ ...data, createdByUserId: userId })) as any;
  }

  async getEvents(): Promise<EventEntity[]> {
    return this.eventRepo.find({ order: { eventDate: 'ASC' } });
  }

  async submitRsvp(eventId: string, userId: string, status: RsvpStatus): Promise<void> {
    await this.dataSource.query(`INSERT INTO event_rsvp (id, event_id, user_id, status) VALUES (uuid_generate_v4(), $1, $2, $3) ON CONFLICT (event_id, user_id) DO UPDATE SET status = $3, responded_at = now()`, [eventId, userId, status]);
  }

  async getEventRsvpSummary(eventId: string): Promise<any> {
    const rows = await this.dataSource.query(`SELECT status, COUNT(*) as count FROM event_rsvp WHERE event_id = $1 GROUP BY status`, [eventId]);
    const summary: any = { attending: 0, notAttending: 0 };
    rows.forEach((r: any) => { if (r.status === 'Attending') summary.attending = parseInt(r.count); else summary.notAttending = parseInt(r.count); });
    return summary;
  }

  async registerDeviceToken(userId: string, token: string, platform: string): Promise<void> {
    await this.dataSource.query(`INSERT INTO device_token (id, user_id, token, platform) VALUES (uuid_generate_v4(), $1, $2, $3) ON CONFLICT (user_id, token) DO UPDATE SET platform = $3, updated_at = now()`, [userId, token, platform]);
  }

  async getEngagementMetrics(startDate: string, endDate: string): Promise<any> {
    const totalResidents = await this.dataSource.query(`SELECT COUNT(*) as count FROM resident_profile`);
    const total = parseInt(totalResidents[0].count) || 1;
    const pollParticipants = await this.dataSource.query(`SELECT COUNT(DISTINCT user_id) as count FROM poll_vote WHERE voted_at BETWEEN $1 AND $2`, [startDate, endDate]);
    const rsvpAttending = await this.dataSource.query(`SELECT COUNT(*) as count FROM event_rsvp WHERE status = 'Attending' AND responded_at BETWEEN $1 AND $2`, [startDate, endDate]);
    const announcementReads = await this.dataSource.query(`SELECT COUNT(DISTINCT user_id) as count FROM announcement_read WHERE read_at BETWEEN $1 AND $2`, [startDate, endDate]);
    return {
      pollParticipationRate: `${((parseInt(pollParticipants[0].count) / total) * 100).toFixed(1)}%`,
      eventRsvpRate: `${((parseInt(rsvpAttending[0].count) / total) * 100).toFixed(1)}%`,
      announcementOpenRate: `${((parseInt(announcementReads[0].count) / total) * 100).toFixed(1)}%`,
    };
  }
}
