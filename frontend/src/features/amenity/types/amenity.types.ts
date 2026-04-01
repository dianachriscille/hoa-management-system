export type BookingStatus = 'Pending' | 'Confirmed' | 'Rejected' | 'Cancelled';

export interface Amenity {
  id: string; name: string; description?: string; location?: string;
  bookingFee?: number; depositAmount?: number; maxAdvanceDays: number;
}

export interface Booking {
  id: string; bookingNumber: string; amenityId: string;
  bookingDate: string; status: BookingStatus;
  bookingFeeAmount?: number; depositAmount?: number; pmNotes?: string; createdAt: string;
}

export type AvailabilityMap = Record<string, 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'UNAVAILABLE'>;
