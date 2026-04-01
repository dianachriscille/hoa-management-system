import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum IncidentCategory { UnauthorizedEntry = 'UnauthorizedEntry', Vandalism = 'Vandalism', NoiseComplaint = 'NoiseComplaint', SuspiciousActivity = 'SuspiciousActivity', Accident = 'Accident', Other = 'Other' }
export enum IncidentStatus { Open = 'Open', UnderReview = 'UnderReview', Resolved = 'Resolved' }

@Entity('visitor_pass')
export class VisitorPassEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'pass_code', length: 8, unique: true }) passCode: string;
  @Column({ name: 'user_id' }) userId: string;
  @Column({ name: 'resident_profile_id' }) residentProfileId: string;
  @Column({ name: 'visitor_name', length: 200 }) visitorName: string;
  @Column({ name: 'valid_date', type: 'date' }) validDate: Date;
  @Column({ name: 'is_revoked', default: false }) isRevoked: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('incident_report')
export class IncidentReportEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'report_number', unique: true }) reportNumber: string;
  @Column({ name: 'reported_by_user_id' }) reportedByUserId: string;
  @Column({ type: 'enum', enum: IncidentCategory }) category: IncidentCategory;
  @Column({ type: 'text' }) description: string;
  @Column({ length: 200, nullable: true }) location: string;
  @Column({ name: 'incident_date', type: 'date' }) incidentDate: Date;
  @Column({ name: 'incident_time', type: 'time', nullable: true }) incidentTime: string;
  @Column({ name: 'photo_key', nullable: true }) photoKey: string;
  @Column({ type: 'enum', enum: IncidentStatus, default: IncidentStatus.Open }) status: IncidentStatus;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
