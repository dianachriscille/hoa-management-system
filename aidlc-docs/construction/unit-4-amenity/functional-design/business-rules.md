# Business Rules — Unit 4: Amenity Booking

## Booking Rules

| ID | Rule |
|---|---|
| BKG-01 | Booking is full-day only — one booking per amenity per calendar date |
| BKG-02 | Booking date must be today or within 7 days from today (Amenity.maxAdvanceDays) |
| BKG-03 | Resident cannot have more than one active (Pending or Confirmed) booking per amenity at a time |
| BKG-04 | Booking date cannot be a blocked date (BlockedDate record exists for that amenity + date) |
| BKG-05 | Booking number auto-generated: `BKG-{YYYY}-{sequence}` |
| BKG-06 | New booking status = Pending (requires PM approval) |
| BKG-07 | Booking fee and deposit amounts copied from Amenity at booking time (snapshot) |
| BKG-08 | On booking submission: PM receives push notification and email |
| BKG-09 | Resident receives push notification confirming submission |

---

## Approval Rules

| ID | Rule |
|---|---|
| APR-01 | Only Property Manager can approve or reject bookings |
| APR-02 | On approval: status = Confirmed, resident notified via push + email |
| APR-03 | On rejection: status = Rejected, PM must provide a rejection reason (pmNotes) |
| APR-04 | Rejected bookings free up the date for other residents |
| APR-05 | PM can approve/reject only Pending bookings |

---

## Cancellation Rules

| ID | Rule |
|---|---|
| CAN-01 | Resident can cancel their own Pending or Confirmed booking |
| CAN-02 | If cancellation is within 24 hours of the booking date: system warns resident before confirming |
| CAN-03 | PM can cancel any Pending or Confirmed booking |
| CAN-04 | On cancellation: status = Cancelled, date freed up, resident notified |
| CAN-05 | Cancelled bookings cannot be reinstated |

---

## Date Blocking Rules

| ID | Rule |
|---|---|
| BLK-01 | Only Property Manager can block dates |
| BLK-02 | Blocking a date that already has Confirmed bookings: those bookings are automatically cancelled with resident notification |
| BLK-03 | Blocking a date that has Pending bookings: those bookings are automatically rejected |
| BLK-04 | PM can unblock a date by deleting the BlockedDate record |
| BLK-05 | Blocked dates shown as unavailable on the availability calendar |

---

## Availability Rules

| ID | Rule |
|---|---|
| AVL-01 | A date is available if: no Confirmed/Pending booking exists AND no BlockedDate record exists |
| AVL-02 | Availability calendar shows next 7 days (maxAdvanceDays) |
| AVL-03 | Past dates are always shown as unavailable |

---

## Notification Rules

| ID | Rule |
|---|---|
| NOTIF-01 | Booking reminder sent 1 day before confirmed booking date via push + email |
| NOTIF-02 | Reminder job runs daily at 08:00 PHT via BullMQ |
| NOTIF-03 | No reminder sent for Pending or Cancelled bookings |

---

## Fee Rules

| ID | Rule |
|---|---|
| FEE-01 | Amenities with bookingFee > 0 display the fee on the booking form |
| FEE-02 | Fee payment is handled offline (cash to PM) — not integrated with GCash in this unit |
| FEE-03 | PM notes field used to record fee payment confirmation |
