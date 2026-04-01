import api from '../../../shared/services/api';
import { MaintenanceRequest } from '../types/maintenance.types';

export const maintenanceService = {
  getMyRequests: () => api.get<MaintenanceRequest[]>('/maintenance/requests/me'),
  getRequest: (id: string) => api.get<MaintenanceRequest>(`/maintenance/requests/${id}`),
  createRequest: (data: any) => api.post<MaintenanceRequest>('/maintenance/requests', data),
  assignRequest: (id: string, data: any) => api.patch<MaintenanceRequest>(`/maintenance/requests/${id}/assign`, data),
  updateStatus: (id: string, data: any) => api.patch<MaintenanceRequest>(`/maintenance/requests/${id}/status`, data),
  confirmResolution: (id: string) => api.post<MaintenanceRequest>(`/maintenance/requests/${id}/confirm`),
  reopenRequest: (id: string) => api.post<MaintenanceRequest>(`/maintenance/requests/${id}/reopen`),
  addNote: (id: string, data: any) => api.post(`/maintenance/requests/${id}/notes`, data),
  getAnalytics: (startDate: string, endDate: string) => api.get(`/maintenance/analytics?startDate=${startDate}&endDate=${endDate}`),
};
