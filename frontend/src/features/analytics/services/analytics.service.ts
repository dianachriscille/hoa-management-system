import api from '../../../shared/services/api';
import { FinancialDashboard, MaintenanceDashboard, EngagementDashboard } from '../types/analytics.types';

export const analyticsService = {
  setBudget: (period: string, amount: number) => api.post('/analytics/budget', { period, amount }),
  getFinancial: (period: string) => api.get<FinancialDashboard>(`/analytics/financial?period=${period}`),
  getMaintenance: (startDate: string, endDate: string) => api.get<MaintenanceDashboard>(`/analytics/maintenance?startDate=${startDate}&endDate=${endDate}`),
  getEngagement: (startDate: string, endDate: string) => api.get<EngagementDashboard>(`/analytics/engagement?startDate=${startDate}&endDate=${endDate}`),
  exportReport: (type: string, period: string, format: string) => {
    window.open(`/api/analytics/export?type=${type}&period=${period}&format=${format}`, '_blank');
  },
};
