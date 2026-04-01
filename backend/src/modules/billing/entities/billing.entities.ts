import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export enum InvoiceStatus { Unpaid = 'Unpaid', PartiallyPaid = 'PartiallyPaid', Paid = 'Paid', Overdue = 'Overdue' }
export enum PaymentMethod { GCash = 'GCash', Manual = 'Manual' }
export enum PaymentStatus { Pending = 'Pending', Completed = 'Completed', Failed = 'Failed' }

@Entity('invoice')
export class InvoiceEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'invoice_number', unique: true }) invoiceNumber: string;
  @Column({ name: 'resident_profile_id' }) residentProfileId: string;
  @Column({ name: 'user_id' }) userId: string;
  @Column({ name: 'billing_period', length: 7 }) billingPeriod: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) amount: number;
  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.Unpaid }) status: InvoiceStatus;
  @Column({ name: 'due_date', type: 'date' }) dueDate: Date;
  @Column({ name: 'paid_at', nullable: true }) paidAt: Date;
  @Column({ name: 'last_reminder_sent_at', nullable: true }) lastReminderSentAt: Date;
  @Column({ name: 'reminder_count', default: 0 }) reminderCount: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany('PaymentEntity', 'invoice') payments: any[];
}

@Entity('payment')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'invoice_id' }) invoiceId: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) amount: number;
  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod }) paymentMethod: PaymentMethod;
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.Pending }) status: PaymentStatus;
  @Column({ name: 'gcash_reference_number', nullable: true }) gcashReferenceNumber: string;
  @Column({ name: 'gcash_payment_id', nullable: true }) gcashPaymentId: string;
  @Column({ name: 'gcash_checkout_url', nullable: true }) gcashCheckoutUrl: string;
  @Column({ name: 'recorded_by', nullable: true }) recordedBy: string;
  @Column({ nullable: true }) notes: string;
  @Column({ name: 'paid_at', nullable: true }) paidAt: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('receipt')
export class ReceiptEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'receipt_number', unique: true }) receiptNumber: string;
  @Column({ name: 'invoice_id', unique: true }) invoiceId: string;
  @Column({ name: 'resident_name' }) residentName: string;
  @Column({ name: 'unit_number' }) unitNumber: string;
  @Column({ name: 'billing_period' }) billingPeriod: string;
  @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2 }) amountPaid: number;
  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod }) paymentMethod: PaymentMethod;
  @Column({ name: 'reference_number', nullable: true }) referenceNumber: string;
  @Column({ name: 'paid_at' }) paidAt: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
