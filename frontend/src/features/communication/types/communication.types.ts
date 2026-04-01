export type PollStatus = 'Active' | 'Closed';
export type RsvpStatus = 'Attending' | 'NotAttending';

export interface Announcement { id: string; title: string; body: string; publishedAt: string; }
export interface PollOption { id: string; optionText: string; displayOrder: number; voteCount: number | null; }
export interface Poll { id: string; question: string; status: PollStatus; closingDate: string; options: PollOption[]; hasVoted: boolean; userVoteOptionId?: string; }
export interface FeedbackForm { id: string; title: string; description?: string; }
export interface Event { id: string; title: string; description?: string; location?: string; eventDate: string; startTime?: string; endTime?: string; }
export interface RsvpSummary { attending: number; notAttending: number; }
