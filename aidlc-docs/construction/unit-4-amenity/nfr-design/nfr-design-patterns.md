# NFR Design Patterns — Unit 4: Amenity Booking

## 1. Double-Booking Prevention (DB Transaction + Unique Constraint)
**Addresses**: REL-A01
- Availability check and booking insert wrapped in TypeORM QueryRunner transaction
- DB unique constraint on (amenityId, bookingDate) for Confirmed/Pending bookings enforced at application layer
- On constraint violation: return 409 Conflict "This date is no longer available"

## 2. Atomic Date Blocking (Cascade Cancellation)
**Addresses**: BLK-02, BLK-03
- Block date + cancel/reject existing bookings in single transaction
- All affected residents notified via BullMQ `amenity-reminders` queue after transaction commits

## 3. BullMQ Delayed Reminder Pattern
**Addresses**: REL-A02, NOTIF-01
- On booking confirmation: enqueue delayed job with delay = (bookingDate - 1 day) - now()
- Job payload: `{ bookingId, userId }`
- Idempotent: check booking status before sending — no-op if Cancelled/Rejected
- On cancellation: cancel pending reminder job

## 4. Availability Computation Pattern
**Addresses**: PERF-A01
- Single optimised query: fetch all Confirmed/Pending bookings + BlockedDates for amenity in date range
- Build availability map in memory — O(n) where n = 7 days
- Result cached in Redis for 60 seconds (TTL invalidated on new booking or block)
