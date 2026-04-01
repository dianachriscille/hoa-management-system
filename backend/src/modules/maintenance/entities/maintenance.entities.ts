import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export enum MaintenanceCategory { Plumbing = 'Plumbing', Electrical = 'Electrical', Structural = 'Structural', Landscaping = 'Landscaping', Other = 'Other' }
export enum MaintenanceStatus { Submitted = 'Submitted', Assigned = 'Assigned', InProgress = 'InProgress', Resolved = 'Resolved', Closed = 'Closed' }

@Entity('maintenance_request')
export class MaintenanceRequestEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'request_number', unique: true }) requestNumber: string;
  @Column({ name: 'user_id' }) userId: string;
  @Column({ name: 'resident_profile_id' }) residentProfileId: string;
  @Column({ type: 'enum', enum: MaintenanceCategory }) category: MaintenanceCategory;
  @Column({ type: 'text' }) description: string;
  @Column({ length: 200 }) location: string;
  @Column({ type: 'enum', enum: MaintenanceStatus, default: MaintenanceStatus.Submitted }) status: MaintenanceStatus;
  @Column({ name: 'assigned_to_user_id', nullable: true }) assignedToUserId: string;
  @Column({ name: 'assigned_at', nullable: true }) assignedAt: Date;
  @Column({ name: 'resolved_at', nullable: true }) resolvedAt: Date;
  @Column({ name: 'closed_at', nullable: true }) closedAt: Date;
  @Column({ name: 'resident_confirmed_at', nullable: true }) residentConfirmedAt: Date;
  @Column({ name: 'reopen_deadline', nullable: true }) reopenDeadline: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany('StatusHistoryEntity', 'request') statusHistory: any[];
  @OneToMany('RequestPhotoEntity', 'request') photos: any[];
  @OneToMany('RequestNoteEntity', 'request') notes: any[];
}

@Entity('status_history')
export class StatusHistoryEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'request_id' }) requestId: string;
  @Column({ name: 'from_status', type: 'enum', enum: MaintenanceStatus, nullable: true }) fromStatus: MaintenanceStatus;
  @Column({ name: 'to_status', type: 'enum', enum: MaintenanceStatus }) toStatus: MaintenanceStatus;
  @Column({ name: 'changed_by_user_id' }) changedByUserId: string;
  @Column({ type: 'text', nullable: true }) note: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('request_photo')
export class RequestPhotoEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'request_id' }) requestId: string;
  @Column({ name: 's3_key' }) s3Key: string;
  @Column({ name: 'uploaded_by_user_id' }) uploadedByUserId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('request_note')
export class RequestNoteEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'request_id' }) requestId: string;
  @Column({ name: 'author_user_id' }) authorUserId: string;
  @Column({ type: 'text' }) content: string;
  @Column({ name: 'is_internal', default: false }) isInternal: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
