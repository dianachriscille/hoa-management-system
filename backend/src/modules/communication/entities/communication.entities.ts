import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AnnouncementStatus { Draft = 'Draft', Published = 'Published' }
export enum PollStatus { Active = 'Active', Closed = 'Closed' }
export enum RsvpStatus { Attending = 'Attending', NotAttending = 'NotAttending' }
export enum DevicePlatform { Web = 'Web', Android = 'Android', iOS = 'iOS' }

@Entity('announcement')
export class AnnouncementEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 200 }) title: string;
  @Column({ type: 'text' }) body: string;
  @Column({ type: 'enum', enum: AnnouncementStatus, default: AnnouncementStatus.Draft }) status: AnnouncementStatus;
  @Column({ name: 'send_push', default: false }) sendPush: boolean;
  @Column({ name: 'send_sms', default: false }) sendSms: boolean;
  @Column({ name: 'published_at', nullable: true }) publishedAt: Date;
  @Column({ name: 'created_by_user_id' }) createdByUserId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('poll')
export class PollEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 500 }) question: string;
  @Column({ type: 'enum', enum: PollStatus, default: PollStatus.Active }) status: PollStatus;
  @Column({ name: 'closing_date', type: 'date' }) closingDate: Date;
  @Column({ name: 'created_by_user_id' }) createdByUserId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('poll_option')
export class PollOptionEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'poll_id' }) pollId: string;
  @Column({ name: 'option_text', length: 200 }) optionText: string;
  @Column({ name: 'display_order' }) displayOrder: number;
}

@Entity('poll_vote')
export class PollVoteEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'poll_id' }) pollId: string;
  @Column({ name: 'option_id' }) optionId: string;
  @Column({ name: 'user_id' }) userId: string;
  @CreateDateColumn({ name: 'voted_at' }) votedAt: Date;
}

@Entity('feedback_form')
export class FeedbackFormEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 200 }) title: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'created_by_user_id' }) createdByUserId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('event')
export class EventEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 200 }) title: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ length: 200, nullable: true }) location: string;
  @Column({ name: 'event_date', type: 'date' }) eventDate: Date;
  @Column({ name: 'start_time', type: 'time', nullable: true }) startTime: string;
  @Column({ name: 'end_time', type: 'time', nullable: true }) endTime: string;
  @Column({ name: 'created_by_user_id' }) createdByUserId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('device_token')
export class DeviceTokenEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id' }) userId: string;
  @Column() token: string;
  @Column({ type: 'enum', enum: DevicePlatform, default: DevicePlatform.Web }) platform: DevicePlatform;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
