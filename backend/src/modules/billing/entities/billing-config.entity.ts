import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('billing_config')
export class BillingConfigEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'monthly_due_amount', type: 'decimal', precision: 10, scale: 2 }) monthlyDueAmount: number;
  @Column({ name: 'due_day_of_month', default: 15 }) dueDayOfMonth: number;
  @Column({ name: 'grace_period_days', default: 7 }) gracePeriodDays: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
