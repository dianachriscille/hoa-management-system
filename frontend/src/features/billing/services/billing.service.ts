import api from '../../../shared/services/api';
import { Invoice, GcashInfo, PendingPayment, BillingDashboard, ManualPaymentRequest } from '../types/billing.types';

export const billingService = {
  getMyInvoices: () => api.get<Invoice[]>('/billing/invoices/me'),
  getInvoice: (id: string) => api.get<Invoice>(`/billing/invoices/${id}`),
  getGcashInfo: () => api.get<GcashInfo>('/billing/gcash-info'),
  submitGcashPayment: (invoiceId: string, data: FormData) => api.post(`/billing/invoices/${invoiceId}/gcash-payment`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPendingPayments: () => api.get<PendingPayment[]>('/billing/payments/pending'),
  verifyPayment: (id: string, approved: boolean) => api.post(`/billing/payments/${id}/verify`, { approved }),
  recordManualPayment: (id: string, data: ManualPaymentRequest) => api.post<Invoice>(`/billing/invoices/${id}/manual-payment`, data),
  generateInvoices: (billingPeriod: string) => api.post('/billing/invoices/generate', { billingPeriod }),
  getDashboard: (period: string) => api.get<BillingDashboard>(`/billing/dashboard?period=${period}`),
};
