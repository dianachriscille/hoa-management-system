import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Axios from 'axios';
import Decimal from 'decimal.js';
import { ConfigService } from '@nestjs/config';
import { InvoiceEntity, PaymentEntity, ReceiptEntity, InvoiceStatus, PaymentMethod, PaymentStatus } from './entities/billing.entities';
import { BillingConfigEntity } from './entities/billing-config.entity';
import { AuditService } from '../../common/audit/audit.service';
import { ResidentService } from '../resident/resident.service';

@Injectable()
export class BillingService {
  // PayMongo API base URL
  private paymongoAxios = Axios.create({ baseURL: 'https://api.paymongo.com/v1', timeout: 10000 });

  constructor(
    @InjectRepository(InvoiceEntity) private invoiceRepo: Repository<InvoiceEntity>,
    @InjectRepository(PaymentEntity) private paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(ReceiptEntity) private receiptRepo: Repository<ReceiptEntity>,
    @InjectRepository(BillingConfigEntity) private configRepo: Repository<BillingConfigEntity>,
    @InjectQueue('invoice-generation') private invoiceQueue: Queue,
    @InjectQueue('receipt-email') private receiptEmailQueue: Queue,
    private config: ConfigService,
    private auditService: AuditService,
    private residentService: ResidentService,
    private dataSource: DataSource,
  ) {
    // PayMongo uses Base64-encoded secret key as Bearer token
    const secretKey = Buffer.from(`${config.get('app.paymongoSecretKey')}:`).toString('base64');
    this.paymongoAxios.defaults.headers.common['Authorization'] = `Basic ${secretKey}`;
    this.paymongoAxios.defaults.headers.common['Content-Type'] = 'application/json';
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

      await this.invoiceRepo.save(this.invoiceRepo.create({
        invoiceNumber, residentProfileId: resident.id, userId: resident.userId,
        billingPeriod, amount: cfg.monthlyDueAmount, dueDate, status: InvoiceStatus.Unpaid,
      }));
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

  async initiatePaymongoPayment(invoiceId: string, userId: string): Promise<{ checkoutUrl: string }> {
    const invoice = await this.getInvoice(invoiceId, userId, 'Resident');
    if (invoice.status === InvoiceStatus.Paid) throw new BadRequestException('Invoice already paid');

    const pending = await this.paymentRepo.findOne({ where: { invoiceId, status: PaymentStatus.Pending } });
    if (pending) throw new ConflictException('A payment is already in progress for this invoice');

    try {
      // PayMongo: create a payment link (supports GCash, Maya, cards)
      const { data } = await this.paymongoAxios.post('/links', {
        data: {
          attributes: {
            amount: Math.round(Number(invoice.amount) * 100), // PayMongo uses centavos
            description: `HOA Dues - ${invoice.billingPeriod}`,
            remarks: invoice.invoiceNumber,
          },
        },
      });

      const checkoutUrl = data.data.attributes.checkout_url;
      const linkId = data.data.id;

      const payment = this.paymentRepo.create({
        invoiceId,
        amount: invoice.amount,
        paymentMethod: PaymentMethod.GCash,
        status: PaymentStatus.Pending,
        gcashPaymentId: linkId,
        gcashCheckoutUrl: checkoutUrl,
      });
      await this.paymentRepo.save(payment);

      return { checkoutUrl };
    } catch (err) {
      throw new BadRequestException('Payment service temporarily unavailable. Please try again.');
    }
  }

  async handlePaymongoWebhook(payload: any): Promise<void> {
    const eventType = payload?.data?.attributes?.type;
    const linkId = payload?.data?.attributes?.data?.id;

    const payment = await this.paymentRepo.findOne({ where: { gcashPaymentId: linkId } });
    if (!payment) return;

    if (eventType === 'link.payment.paid') {
      payment.status = PaymentStatus.Completed;
      payment.gcashReferenceNumber = payload?.data?.attributes?.data?.attributes?.reference_number;
      payment.paidAt = new Date();
      await this.paymentRepo.save(payment);
      await this.updateInvoiceAfterPayment(payment.invoiceId, payment.amount, PaymentMethod.GCash, payment.gcashReferenceNumber);
    } else {
      payment.status = PaymentStatus.Failed;
      await this.paymentRepo.save(payment);
    }

    await this.auditService.log({ action: 'PAYMONGO_WEBHOOK_PROCESSED', entityType: 'Payment', entityId: payment.id, metadata: { status: payment.status } });
  }

  async recordManualPayment(invoiceId: string, dto: any, recordedBy: string): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === InvoiceStatus.Paid) throw new BadRequestException('Invoice already paid');

    const totalPaid = await this.getTotalPaid(invoiceId);
    const remaining = new Decimal(invoice.amount).minus(totalPaid);
    if (new Decimal(dto.amount).gt(remaining)) throw new BadRequestException(`Amount exceeds remaining balance of ₱${remaining.toFixed(2)}`);

    const payment = this.paymentRepo.create({ invoiceId, amount: dto.amount, paymentMethod: PaymentMethod.Manual, status: PaymentStatus.Completed, recordedBy, notes: dto.notes, gcashReferenceNumber: dto.referenceNumber, paidAt: new Date() } as any);
    await this.paymentRepo.save(payment);
    await this.auditService.log({ userId: recordedBy, action: 'MANUAL_PAYMENT_RECORDED', entityType: 'Invoice', entityId: invoiceId });
    return this.updateInvoiceAfterPayment(invoiceId, dto.amount, PaymentMethod.Manual, dto.referenceNumber);
  }

  async getDashboard(period: string, role: string): Promise<any> {
    const invoices = await this.invoiceRepo.find({ where: { billingPeriod: period } });
    const total = invoices.length;
    const paid = invoices.filter(i => i.status === InvoiceStatus.Paid).length;
    const outstanding = invoices.filter(i => [InvoiceStatus.Unpaid, InvoiceStatus.PartiallyPaid].includes(i.status)).length;
    const overdue = invoices.filter(i => i.status === InvoiceStatus.Overdue).length;
    const collectionRate = total > 0 ? ((paid / total) * 100).toFixed(1) : '0.0';
    return { total, paid, outstanding, overdue, collectionRate: `${collectionRate}%` };
  }

  private async getTotalPaid(invoiceId: string): Promise<Decimal> {
    const payments = await this.paymentRepo.find({ where: { invoiceId, status: PaymentStatus.Completed } });
    return payments.reduce((sum, p) => sum.plus(p.amount), new Decimal(0));
  }

  private async updateInvoiceAfterPayment(invoiceId: string, amount: number, method: PaymentMethod, referenceNumber?: string): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
    if (!invoice) return invoice as any;
    const totalPaid = await this.getTotalPaid(invoiceId);

    if (totalPaid.gte(invoice.amount)) {
      invoice.status = InvoiceStatus.Paid;
      invoice.paidAt = new Date();
      await this.invoiceRepo.save(invoice);
      await this.generateReceipt(invoice, method, referenceNumber);
    } else {
      invoice.status = InvoiceStatus.PartiallyPaid;
      await this.invoiceRepo.save(invoice);
    }
    return invoice;
  }

  private async generateReceipt(invoice: InvoiceEntity, method: PaymentMethod, referenceNumber?: string): Promise<void> {
    const seq = await this.dataSource.query(`SELECT nextval('receipt_number_seq') as seq`);
    const receiptNumber = `RCP-${invoice.billingPeriod}-${String(seq[0].seq).padStart(3, '0')}`;
    const profile = await this.residentService.getMyProfile(invoice.userId);
    const receipt = this.receiptRepo.create({
      receiptNumber, invoiceId: invoice.id,
      residentName: `${(profile as any).firstName} ${(profile as any).lastName}`,
      unitNumber: (profile as any).unitNumber,
      billingPeriod: invoice.billingPeriod,
      amountPaid: invoice.amount,
      paymentMethod: method,
      referenceNumber,
      paidAt: invoice.paidAt,
    });
    await this.receiptRepo.save(receipt);
    await this.receiptEmailQueue.add('send-receipt', { receiptId: receipt.id, userId: invoice.userId });
  }
}
