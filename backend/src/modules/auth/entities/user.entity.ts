import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Role } from '../auth.dto';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true, length: 255 }) email: string;
  @Column({ name: 'password_hash' }) passwordHash: string;
  @Column({ type: 'enum', enum: Role, default: Role.Resident }) role: Role;
  @Column({ name: 'is_email_verified', default: false }) isEmailVerified: boolean;
  @Column({ name: 'email_verification_token', nullable: true }) emailVerificationToken: string;
  @Column({ name: 'password_reset_token', nullable: true }) passwordResetToken: string;
  @Column({ name: 'password_reset_expires_at', nullable: true }) passwordResetExpiresAt: Date;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @DeleteDateColumn({ name: 'deleted_at' }) deletedAt: Date;
}
