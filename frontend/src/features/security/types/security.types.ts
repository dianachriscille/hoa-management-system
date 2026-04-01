export interface VisitorPass { id: string; passCode: string; visitorName: string; validDate: string; isRevoked: boolean; createdAt: string; }
export interface VisitorPassWithQR extends VisitorPass { qrDataUrl: string; }
export interface VerificationResult { valid: boolean; reason?: string; visitorName?: string; unitNumber?: string; validDate?: string; }
export interface IncidentReport { id: string; reportNumber: string; category: string; description: string; location?: string; incidentDate: string; status: string; createdAt: string; }
