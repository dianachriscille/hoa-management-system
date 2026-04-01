# Domain Entities — Unit 4: Amenity Booking

## Entity: Amenity

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| name | string | not null, unique, max 100 |
| description | text | nullable |
| location | string | nullable, max 200 |
| capacity | integer | nullable |
| bookingFee | decimal(10,2) | nullable (null = free) |
| depositAmount | decimal(10,2) | nullable |
| maxAdvanceDays | integer | not null, default 7 |
| isActive | boolean | default true |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

**Seed data**: Clubhouse (fee: configurable), Basketball Court (free)

---

## Entity: Booking

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| bookingNumber | string | unique, auto-generated (e.g., BKG-2025-001) |
| amenityId | UUID | FK → Amenity.id, not null |
| userId | UUID | FK → User.id, not null |
| residentProfileId | UUID | FK → ResidentProfile.id, not null |
| bookingDate | date | not null (full-day booking) |
| status | enum | Pending, Confirmed, Rejected, Cancelled |
| bookingFeeAmount | decimal(10,2) | nullable (snapshot at booking time) |
| depositAmount | decimal(10,2) | nullable |
| pmNotes | text | nullable (PM approval/rejection reason) |
| reminderSentAt | timestamp | nullable |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

**Constraints**:
- One active booking (Pending or Confirmed) per resident per amenity per date
- Booking date must be within maxAdvanceDays from today

---

## Entity: BlockedDate

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| amenityId | UUID | FK → Amenity.id, not null |
| blockedDate | date | not null |
| reason | string | nullable, max 200 |
| blockedByUserId | UUID | FK → User.id, not null |
| createdAt | timestamp | auto |

**Constraint**: Unique (amenityId, blockedDate) — one block record per amenity per date.

---

## Enumerations

### BookingStatus
- `Pending` — submitted, awaiting PM approval
- `Confirmed` — approved by PM
- `Rejected` — rejected by PM
- `Cancelled` — cancelled by resident or PM

---

## Entity Relationships

```
Amenity (1) -------- (N) Booking
Amenity (1) -------- (N) BlockedDate
ResidentProfile (1) - (N) Booking
User (1) ----------- (N) Booking
```
