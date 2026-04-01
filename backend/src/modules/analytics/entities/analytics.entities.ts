import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('monthly_budget')
export class MonthlyBudgetEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 7, unique: true }) period: string;
  @Column({ name: 'budget_amount', type: 'decimal', precision: 10, scale: 2 }) budgetAmount: number;
  @Column({ name: 'created_by_user_id' }) createdByUserId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
