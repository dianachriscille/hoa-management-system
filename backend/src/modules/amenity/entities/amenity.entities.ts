import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum BookingStatus { Pending = 'Pending', Confirmed = 'Confirmed', Rejected = 'Rejected', Cancelled = 'Cancelled' }

@Entity('amenity')
export class AmenityEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 100, unique: true }) name: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ length: 200, nullable: true }) location: string;
  @Column({ nullable: true }) capacity: number;
  @Column({ name: 'booking_fee', type: 'decimal', precision: 10, scale: 2, nullable: true }) bookingFee: number;
  @Column({ name: 'deposit_amount', type: 'decimal', precision: 10, scale: 2, nullable: true }) depositAmount: number;
  @Column({ name: 'max_advance_days', default: 7 }) maxAdvanceDays: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('booking')
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'booking_number', unique: true }) bookingNumber: string;
  @Column({ name: 'amenity_id' }) amenityId: string;
  @Column({ name: 'user_id' }) userId: string;
  @Column({ name: 'resident_profile_id' }) residentProfileId: string;
  @Column({ name: 'booking_date', type: 'date' }) bookingDate: Date;
  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.Pending }) status: BookingStatus;
  @Column({ name: 'booking_fee_amount', type: 'decimal', precision: 10, scale: 2, nullable: true }) bookingFeeAmount: number;
  @Column({ name: 'deposit_amount', type: 'decimal', precision: 10, scale: 2, nullable: true }) depositAmount: number;
  @Column({ name: 'pm_notes', type: 'text', nullable: true }) pmNotes: string;
  @Column({ name: 'reminder_sent_at', nullable: true }) reminderSentAt: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('blocked_date')
export class BlockedDateEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'amenity_id' }) amenityId: string;
  @Column({ name: 'blocked_date', type: 'date' }) blockedDate: Date;
  @Column({ length: 200, nullable: true }) reason: string;
  @Column({ name: 'blocked_by_user_id' }) blockedByUserId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
