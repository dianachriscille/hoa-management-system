# Infrastructure Design — Unit 4: Amenity Booking

## Shared Infrastructure (from Unit 1)
All compute, network, database, cache, storage, API Gateway, and CI/CD resources shared from Unit 1.

## New Infrastructure for Unit 4

### BullMQ Queue
- Queue name: `amenity-reminders`
- Uses shared ElastiCache Redis — no new infrastructure needed

### Database Seed Data
- Terraform `null_resource` or migration seed script provisions initial amenities:
  - Clubhouse (bookingFee: 500.00, depositAmount: 1000.00, maxAdvanceDays: 7)
  - Basketball Court (bookingFee: null, depositAmount: null, maxAdvanceDays: 7)

### Terraform Changes
- No new AWS resources required
- Seed data added to existing migration scripts
