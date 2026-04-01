import api from '../../../shared/services/api';
import { Document, DocumentCategory, DocumentVersion } from '../types/document.types';

export const documentService = {
  listDocuments: (category?: DocumentCategory, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return api.get<Document[]>(`/documents?${params}`);
  },
  getDownloadUrl: (id: string) => api.get<{ url: string; provider: string }>(`/documents/${id}/download`),
  getVersionHistory: (id: string) => api.get<DocumentVersion[]>(`/documents/${id}/versions`),
  uploadDocument: (formData: FormData) => api.post<Document>('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadNewVersion: (id: string, formData: FormData) => api.post<Document>(`/documents/${id}/version`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteDocument: (id: string) => api.delete(`/documents/${id}`),
};
