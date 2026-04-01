# Business Logic Model — Unit 4: Amenity Booking

## Flow 1: View Amenity Availability

```
1. Resident selects an amenity

2. Compute availability for next 7 days:
   For each date from today to today+7:
     a. Check BlockedDate: if exists → BLOCKED
     b. Check Booking: if Confirmed or Pending exists → BOOKED
     c. If past date → UNAVAILABLE
     d. Otherwise → AVAILABLE

3. Return availability map: { date: 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'UNAVAILABLE' }

4. Frontend renders calendar with color-coded dates
```

---

## Flow 2: Create Booking

```
1. Resident selects amenity + date, clicks "Book"

2. Validate:
   - bookingDate >= today AND bookingDate <= today + 7 (BKG-02)
   - No BlockedDate for amenityId + bookingDate (BKG-04)
   - No existing Pending/Confirmed booking for this resident + amenity (BKG-03)
   - No existing Confirmed/Pending booking by any resident for this amenity + date (BKG-01)

3. Generate booking number: BKG-{YYYY}-{seq}

4. Create Booking:
   - status = Pending
   - bookingFeeAmount = Amenity.bookingFee (snapshot)
   - depositAmount = Amenity.depositAmount (snapshot)

5. Notify PM: push + email "New booking request #{bookingNumber} for {amenityName} on {date}"

6. Notify Resident: push "Your booking #{bookingNumber} is pending approval"

7. Log AuditLog: action = BOOKING_CREATED

8. Return created booking
```

---

## Flow 3: PM Approves Booking

```
1. PM clicks "Approve" on Pending booking

2. Validate: booking status = Pending

3. Update Booking: status = Confirmed

4. Schedule BullMQ reminder job:
   - Delay = (bookingDate - 1 day) - now()
   - Job: send reminder to resident

5. Notify Resident: push + email "Your booking #{bookingNumber} for {amenityName} on {date} has been confirmed!"

6. Log AuditLog: action = BOOKING_CONFIRMED
```

---

## Flow 4: PM Rejects Booking

```
1. PM submits rejection with pmNotes (reason required)

2. Validate: booking status = Pending, pmNotes not empty

3. Update Booking: status = Rejected, pmNotes = reason

4. Notify Resident: push + email "Your booking #{bookingNumber} was not approved. Reason: {pmNotes}"

5. Log AuditLog: action = BOOKING_REJECTED
```

---

## Flow 5: Resident Cancels Booking

```
1. Resident clicks "Cancel" on Pending or Confirmed booking

2. Validate:
   - Booking belongs to resident
   - Status is Pending or Confirmed

3. If bookingDate is within 24 hours:
   - Return warning to frontend: "Cancellation within 24 hours of booking date. Confirm?"
   - Frontend shows confirmation dialog

4. On confirmation:
   - Update Booking: status = Cancelled
   - Cancel pending BullMQ reminder job (if exists)
   - Notify PM: "Booking #{bookingNumber} cancelled by resident"

5. Log AuditLog: action = BOOKING_CANCELLED
```

---

## Flow 6: PM Blocks a Date

```
1. PM selects amenity + date range + reason, clicks "Block"

2. For each date in range:
   a. Create BlockedDate record (skip if already exists)
   b. Find all Confirmed bookings for amenityId + date:
      - Cancel each: status = Cancelled
      - Notify each resident: "Your booking #{bookingNumber} has been cancelled due to a scheduled closure"
   c. Find all Pending bookings for amenityId + date:
      - Reject each: status = Rejected, pmNotes = "Date blocked by management"
      - Notify each resident

3. Log AuditLog: action = DATES_BLOCKED, metadata = { amenityId, dates, reason }
```

---

## Flow 7: Booking Reminder Job (BullMQ)

```
1. BullMQ job fires 1 day before confirmed booking date

2. Load booking by ID

3. If status = Confirmed:
   - Send push + email to resident: "Reminder: Your booking for {amenityName} is tomorrow ({date})"
   - Update Booking.reminderSentAt = now()

4. If status != Confirmed (cancelled/rejected): no-op
```
