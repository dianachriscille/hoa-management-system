import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import Decimal from 'decimal.js';
import { ConfigService } from '@nestjs/config';
import { InvoiceEntity, PaymentEntity, ReceiptEntity, InvoiceStatus, PaymentMethod, PaymentStatus } from './entities/billing.entities';
import { BillingConfigEntity } from './entities/billing-config.entity';
import { AuditService } from '../../common/audit/audit.service';
import { ResidentService } from '../resident/resident.service';
import { FileService } from '../file/file.service';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(InvoiceEntity) private invoiceRepo: Repository<InvoiceEntity>,
    @InjectRepository(PaymentEntity) private paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(ReceiptEntity) private receiptRepo: Repository<ReceiptEntity>,
    @InjectRepository(BillingConfigEntity) private configRepo: Repository<BillingConfigEntity>,
    private config: ConfigService,
    private auditService: AuditService,
    private residentService: ResidentService,
    private fileService: FileService,
    private dataSource: DataSource,
  ) {}

  async getGcashInfo(): Promise<{ qrCodeUrl: string; accountName: string; gcashNumber: string }> {
    const cfg = await this.configRepo.findOne({ where: { isActive: true } });
    if (!cfg) throw new BadRequestException('No active billing configuration found');
    return { qrCodeUrl: cfg.gcashQrCodeUrl || '', accountName: cfg.gcashAccountName || '', gcashNumber: cfg.gcashNumber || '' };
  }

  async submitGcashPayment(invoiceId: string, userId: string, gcashReferenceNumber: string, screenshotFile: Express.Multer.File, notes?: string): Promise<PaymentEntity> {
    const invoice = await this.getInvoice(invoiceId, userId, 'Resident');
    if (invoice.status === InvoiceStatus.Paid) throw new BadRequestException('Invoice already paid');
    const pending = await this.paymentRepo.findOne({ where: { invoiceId, status: PaymentStatus.Pending } });
    if (pending) throw new ConflictException('A payment is already pending verification for this invoice');

    const { url } = await this.fileService.uploadBuffer(screenshotFile.buffer, 'gcash-screenshots', screenshotFile.mimetype);

    const payment = await this.paymentRepo.save(this.paymentRepo.create({
      invoiceId,
      amount: invoice.amount,
      paymentMethod: PaymentMethod.GCashScreenshot,
      status: PaymentStatus.Pending,
      gcashReferenceNumber,
      screenshotUrl: url,
      notes,
    }));

    await this.auditService.log({ userId, action: 'GCASH_PAYMENT_SUBMITTED', entityType: 'Payment', entityId: payment.id });
    return payment;
  }

  async getPendingPayments(): Promise<PaymentEntity[]> {
    return this.paymentRepo.find({ where: { status: PaymentStatus.Pending, paymentMethod: PaymentMethod.GCashScreenshot }, order: { createdAt: 'ASC' } });
  }

  async verifyPayment(paymentId: string, approved: boolean, pmUserId: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.Pending) throw new BadRequestException('Payment already processed');

    if (approved) {
      payment.status = PaymentStatus.Completed;
      payment.isVerified = true;
      payment.paidAt = new Date();
      payment.recordedBy = pmUserId;
      await this.paymentRepo.save(payment);
      await this.updateInvoiceAfterPayment(payment.invoiceId, payment.amount);
    } else {
      payment.status = PaymentStatus.Failed;
      payment.recordedBy = pmUserId;
      await this.paymentRepo.save(payment);
    }

    await this.auditService.log({ userId: pmUserId, action: approved ? 'PAYMENT_APPROVED' : 'PAYMENT_REJECTED', entityType: 'Payment', entityId: paymentId });
    return payment;
  }

  async generateInvoices(billingPeriod: string, triggeredBy: string): Promise<{ generated: number; skipped: number }> {
    const cfg = await this.configRepo.findOne({ where: { isActive: true } });
    if (!cfg) throw new BadRequestException('No active billing configuration found');
    const { data: residents } = await this.residentService.getDirectory();
    let generated = 0, skipped = 0;
    for (const resident of residents) {
      const exists = await this.invoiceRepo.findOne({ where: { residentProfileId: resident.id, billingPeriod } });
      if (exists) { skipped++; continue; }
      const [year, month] = billingPeriod.split('-').map(Number);
      const dueDate = new Date(year, month - 1, cfg.dueDayOfMonth);
      const seq = await this.dataSource.query(`SELECT nextval('invoice_number_seq') as seq`);
      const invoiceNumber = `INV-${billingPeriod}-${String(seq[0].seq).padStart(3, '0')}`;
      await this.invoiceRepo.save(this.invoiceRepo.create({ invoiceNumber, residentProfileId: resident.id, userId: resident.userId, billingPeriod, amount: cfg.monthlyDueAmount, dueDate, status: InvoiceStatus.Unpaid }));
      generated++;
    }
    await this.auditService.log({ userId: triggeredBy, action: 'INVOICES_GENERATED', entityType: 'Invoice', metadata: { billingPeriod, generated, skipped } });
    return { generated, skipped };
  }

  async getMyInvoices(userId: string): Promise<InvoiceEntity[]> {
    return this.invoiceRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async getInvoice(id: string, userId: string, role: string): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepo.findOne({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (role === 'Resident' && invoice.userId !== userId) throw new BadRequestException('Access denied');
    return invoice;
  }

  async recordManualPayment(invoiceId: string, dto: any, recordedBy: string): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === InvoiceStatus.Paid) throw new BadRequestException('Invoice already paid');
    const totalPaid = await this.getTotalPaid(invoiceId);
    const remaining = new Decimal(invoice.amount).minus(totalPaid);
    if (new Decimal(dto.amount).gt(remaining)) throw new BadRequestException('Amount exceeds remaining balance');
    await this.paymentRepo.save(this.paymentRepo.create({ invoiceId, amount: dto.amount, paymentMethod: PaymentMethod.Manual, status: PaymentStatus.Completed, recordedBy, notes: dto.notes, gcashReferenceNumber: dto.referenceNumber, isVerified: true, paidAt: new Date() } as any));
    await this.auditService.log({ userId: recordedBy, action: 'MANUAL_PAYMENT_RECORDED', entityType: 'Invoice', entityId: invoiceId });
    return this.updateInvoiceAfterPayment(invoiceId, dto.amount);
  }

  async getDashboard(period: string, role: string): Promise<any> {
    const invoices = await this.invoiceRepo.find({ where: { billingPeriod: period } });
    const total = invoices.length;
    const paid = invoices.filter(i => i.status === InvoiceStatus.Paid).length;
    const outstanding = invoices.filter(i => [InvoiceStatus.Unpaid, InvoiceStatus.PartiallyPaid].includes(i.status)).length;
    const overdue = invoices.filter(i => i.status === InvoiceStatus.Overdue).length;
    const pendingVerification = await this.paymentRepo.count({ where: { status: PaymentStatus.Pending, paymentMethod: PaymentMethod.GCashScreenshot } });
    return { total, paid, outstanding, overdue, pendingVerification, collectionRate: `${total > 0 ? ((paid / total) * 100).toFixed(1) : '0.0'}%` };
  }

  private async getTotalPaid(invoiceId: string): Promise<Decimal> {
    const payments = await this.paymentRepo.find({ where: { invoiceId, status: PaymentStatus.Completed } });
    return payments.reduce((sum, p) => sum.plus(p.amount), new Decimal(0));
  }

  private async updateInvoiceAfterPayment(invoiceId: string, amount: number): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
    if (!invoice) return invoice as any;
    const totalPaid = await this.getTotalPaid(invoiceId);
    invoice.status = totalPaid.gte(invoice.amount) ? InvoiceStatus.Paid : InvoiceStatus.PartiallyPaid;
    if (invoice.status === InvoiceStatus.Paid) invoice.paidAt = new Date();
    await this.invoiceRepo.save(invoice);
    return invoice;
  }
}
