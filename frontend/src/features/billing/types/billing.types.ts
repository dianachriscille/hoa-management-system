export type InvoiceStatus = 'Unpaid' | 'PartiallyPaid' | 'Paid' | 'Overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  billingPeriod: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

export interface BillingDashboard {
  total: number;
  paid: number;
  outstanding: number;
  overdue: number;
  collectionRate: string;
}

export interface ManualPaymentRequest {
  amount: number;
  paymentMethod: 'Cash' | 'Cheque';
  referenceNumber?: string;
  notes?: string;
}
