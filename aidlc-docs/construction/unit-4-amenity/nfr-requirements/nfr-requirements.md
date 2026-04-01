# NFR Requirements — Unit 4: Amenity Booking

## Inherited NFRs
All Unit 1–3 NFRs apply: < 500ms p95, RDS, Redis, ECS auto-scaling, CloudWatch, TLS, DPA 2012, BullMQ patterns.

## Amenity-Specific NFRs

| ID | Requirement |
|---|---|
| PERF-A01 | Availability calendar endpoint < 500ms p95 |
| PERF-A02 | Booking creation < 500ms p95 |
| REL-A01 | Booking creation is atomic — availability check and booking insert in single DB transaction to prevent double-booking |
| REL-A02 | BullMQ reminder job: 2 retries on failure |
| SEC-A01 | Residents can only view/cancel their own bookings |
| SEC-A02 | PM approval/rejection/blocking restricted to PropertyManager role |
| RET-A01 | Booking records retained indefinitely |
| MON-A01 | CloudWatch alarm on double-booking constraint violations (DB unique constraint errors) |

## Tech Stack Additions

| Concern | Decision |
|---|---|
| BullMQ queue | `amenity-reminders` — delayed job 1 day before booking date |
| Availability query | Single SQL query joining Booking + BlockedDate for efficiency |
