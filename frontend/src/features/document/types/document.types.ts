export type DocumentCategory = 'Policies' | 'MeetingMinutes' | 'Forms' | 'Announcements';
export type StorageProvider = 'GoogleDrive' | 'S3';

export interface Document {
  id: string; title: string; category: DocumentCategory;
  description?: string; currentVersionId?: string; createdAt: string;
}

export interface DocumentVersion {
  id: string; versionNumber: number; storageProvider: StorageProvider;
  fileSizeBytes?: number; mimeType?: string; createdAt: string;
}
