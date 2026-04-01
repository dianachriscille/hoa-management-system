import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../auth/entities/user.entity';

@Entity('resident_profile')
export class ResidentProfileEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id' }) userId: string;
  @Column({ name: 'unit_number', length: 20, unique: true }) unitNumber: string;
  @Column({ name: 'first_name', length: 100 }) firstName: string;
  @Column({ name: 'last_name', length: 100 }) lastName: string;
  @Column({ name: 'contact_number', length: 20 }) contactNumber: string;
  @Column({ name: 'vehicle_plate_1', length: 20, nullable: true }) vehiclePlate1: string;
  @Column({ name: 'vehicle_plate_2', length: 20, nullable: true }) vehiclePlate2: string;
  @Column({ name: 'emergency_contact_name', length: 200, nullable: true }) emergencyContactName: string;
  @Column({ name: 'emergency_contact_number', length: 20, nullable: true }) emergencyContactNumber: string;
  @Column({ name: 'profile_photo_key', nullable: true }) profilePhotoKey: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToOne(() => UserEntity) @JoinColumn({ name: 'user_id' }) user: UserEntity;
}
