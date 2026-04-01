import api from '../../../shared/services/api';
import { VisitorPassWithQR, VisitorPass, VerificationResult, IncidentReport } from '../types/security.types';

export const securityService = {
  createPass: (visitorName: string, validDate: string) => api.post<{ pass: VisitorPassWithQR; qrDataUrl: string }>('/security/visitor-passes', { visitorName, validDate }),
  getMyPasses: () => api.get<VisitorPass[]>('/security/visitor-passes/me'),
  revokePass: (id: string) => api.post(`/security/visitor-passes/${id}/revoke`),
  verifyPass: (code: string, payload?: string) => api.get<VerificationResult>(`/security/visitor-passes/verify?code=${code}${payload ? `&payload=${encodeURIComponent(payload)}` : ''}`),
  getTodayVisitors: () => api.get<VisitorPass[]>('/security/visitor-passes/today'),
  lookupResident: (unit: string) => api.get(`/security/residents/lookup?unit=${unit}`),
  createIncident: (data: any) => api.post<IncidentReport>('/security/incidents', data),
  getMyIncidents: () => api.get<IncidentReport[]>('/security/incidents/me'),
  getAllIncidents: () => api.get<IncidentReport[]>('/security/incidents'),
};
