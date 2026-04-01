import api from '../../../shared/services/api';
import { Announcement, Poll, FeedbackForm, Event, RsvpStatus, RsvpSummary } from '../types/communication.types';

export const communicationService = {
  getAnnouncements: () => api.get<Announcement[]>('/communication/announcements'),
  createAnnouncement: (data: any) => api.post<Announcement>('/communication/announcements', data),
  markRead: (id: string) => api.post(`/communication/announcements/${id}/read`),
  getPolls: () => api.get<Poll[]>('/communication/polls'),
  createPoll: (data: any) => api.post<Poll>('/communication/polls', data),
  vote: (pollId: string, optionId: string) => api.post(`/communication/polls/${pollId}/vote`, { optionId }),
  getForms: () => api.get<FeedbackForm[]>('/communication/forms'),
  submitFeedback: (formId: string, answers: any[]) => api.post(`/communication/forms/${formId}/respond`, { answers }),
  getEvents: () => api.get<Event[]>('/communication/events'),
  createEvent: (data: any) => api.post<Event>('/communication/events', data),
  rsvp: (eventId: string, status: RsvpStatus) => api.post(`/communication/events/${eventId}/rsvp`, { status }),
  getRsvpSummary: (eventId: string) => api.get<RsvpSummary>(`/communication/events/${eventId}/rsvp`),
  registerDeviceToken: (token: string, platform: string) => api.post('/communication/device-token', { token, platform }),
  getMetrics: (startDate: string, endDate: string) => api.get(`/communication/metrics?startDate=${startDate}&endDate=${endDate}`),
};
