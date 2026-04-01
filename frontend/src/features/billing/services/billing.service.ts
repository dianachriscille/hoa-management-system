import api from '../../../shared/services/api';
import { Invoice, BillingDashboard, ManualPaymentRequest } from '../types/billing.types';

export const billingService = {
  getMyInvoices: () => api.get<Invoice[]>('/billing/invoices/me'),
  getInvoice: (id: string) => api.get<Invoice>(`/billing/invoices/${id}`),
  initiatePayment: (id: string) => api.post<{ checkoutUrl: string }>(`/billing/invoices/${id}/pay`),
  recordManualPayment: (id: string, data: ManualPaymentRequest) => api.post<Invoice>(`/billing/invoices/${id}/manual-payment`, data),
  generateInvoices: (billingPeriod: string) => api.post('/billing/invoices/generate', { billingPeriod }),
  getDashboard: (period: string) => api.get<BillingDashboard>(`/billing/dashboard?period=${period}`),
};
