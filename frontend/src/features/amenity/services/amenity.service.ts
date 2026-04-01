import api from '../../../shared/services/api';
import { Amenity, Booking, AvailabilityMap } from '../types/amenity.types';

export const amenityService = {
  getAmenities: () => api.get<Amenity[]>('/amenity'),
  getAvailability: (id: string) => api.get<AvailabilityMap>(`/amenity/${id}/availability`),
  createBooking: (amenityId: string, bookingDate: string) => api.post<Booking>('/amenity/bookings', { amenityId, bookingDate }),
  getMyBookings: () => api.get<Booking[]>('/amenity/bookings/me'),
  cancelBooking: (id: string) => api.post<Booking>(`/amenity/bookings/${id}/cancel`),
  getPendingBookings: () => api.get<Booking[]>('/amenity/bookings/pending'),
  approveBooking: (id: string) => api.post<Booking>(`/amenity/bookings/${id}/approve`),
  rejectBooking: (id: string, reason: string) => api.post<Booking>(`/amenity/bookings/${id}/reject`, { reason }),
  blockDates: (amenityId: string, dates: string[], reason: string) => api.post(`/amenity/${amenityId}/block-dates`, { dates, reason }),
};
