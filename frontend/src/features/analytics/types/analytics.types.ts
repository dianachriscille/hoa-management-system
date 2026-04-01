export interface FinancialDashboard {
  period: string; budgetAmount: number | null;
  totalInvoiced: number; totalCollected: number; totalOutstanding: number; collectionRate: string;
  overdueAging: { bucket: string; count: number; amount: number }[];
}
export interface MaintenanceDashboard {
  open: number; closed: number; avgResolutionDays: string;
  byCategory: { category: string; count: number }[];
}
export interface EngagementDashboard {
  pollParticipationRate: string; eventRsvpRate: string; announcementOpenRate: string;
}
