export type MaintenanceStatus = 'Submitted' | 'Assigned' | 'InProgress' | 'Resolved' | 'Closed';
export type MaintenanceCategory = 'Plumbing' | 'Electrical' | 'Structural' | 'Landscaping' | 'Other';

export interface MaintenanceRequest {
  id: string;
  requestNumber: string;
  category: MaintenanceCategory;
  description: string;
  location: string;
  status: MaintenanceStatus;
  assignedToUserId?: string;
  resolvedAt?: string;
  reopenDeadline?: string;
  createdAt: string;
  photos?: { id: string; s3Key: string; presignedUrl?: string }[];
  statusHistory?: StatusHistoryEntry[];
  notes?: RequestNote[];
}

export interface StatusHistoryEntry {
  id: string;
  fromStatus?: MaintenanceStatus;
  toStatus: MaintenanceStatus;
  note?: string;
  createdAt: string;
}

export interface RequestNote {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}
