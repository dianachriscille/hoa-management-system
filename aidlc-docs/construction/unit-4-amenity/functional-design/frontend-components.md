# Frontend Components — Unit 4: Amenity Booking

## Feature: amenity (`src/features/amenity/`)

### Component Hierarchy

```
AmenityLayout
├── AmenityListPage (Resident)
│   └── AmenityCard (per amenity)
│       ├── AmenityName + Location
│       ├── FeeLabel (if bookingFee > 0)
│       └── ViewAvailabilityButton
│
├── AmenityAvailabilityPage (Resident)
│   ├── AmenityHeader (name, description, fee)
│   ├── AvailabilityCalendar (7-day view)
│   │   └── DayCell (AVAILABLE / BOOKED / BLOCKED / UNAVAILABLE)
│   └── BookButton (enabled only on AVAILABLE date)
│
├── BookingConfirmModal (Resident)
│   ├── BookingSummary (amenity, date, fee info)
│   ├── FeeNotice (if fee > 0: "Fee payable to PM upon approval")
│   └── ConfirmBookingButton
│
├── MyBookingsPage (Resident)
│   ├── BookingFilterTabs (All / Pending / Confirmed / Cancelled)
│   └── BookingCard (per booking)
│       ├── BookingStatusBadge
│       ├── AmenityName + Date
│       └── CancelButton (if Pending or Confirmed)
│
└── AmenityManagementPage (Property Manager)
    ├── AmenityList
    │   └── AmenityRow
    │       ├── EditAmenityButton
    │       └── BlockDatesButton
    ├── PendingBookingsList
    │   └── PendingBookingRow
    │       ├── ResidentName + AmenityName + Date
    │       ├── ApproveButton
    │       └── RejectButton (opens RejectModal)
    ├── RejectBookingModal
    │   └── RejectionReasonInput (required)
    └── BlockDatesModal
        ├── DateRangePicker
        ├── ReasonInput
        └── BlockButton
```

---

### State Management

| Component | State | Description |
|---|---|---|
| AmenityAvailabilityPage | `{ availability, selectedDate, isLoading }` | Calendar + selected date |
| BookingConfirmModal | `{ isOpen, amenityId, date, isSubmitting }` | Booking confirmation |
| MyBookingsPage | `{ bookings[], filter, isLoading }` | Resident booking list |
| AmenityManagementPage | `{ pendingBookings[], isLoading }` | PM pending approvals |
| RejectBookingModal | `{ isOpen, bookingId, reason, isSubmitting }` | Rejection form |

---

### API Integration Points

| Component | Endpoint | Method |
|---|---|---|
| AmenityListPage | `/amenity` | GET |
| AmenityAvailabilityPage | `/amenity/:id/availability` | GET |
| BookingConfirmModal | `/amenity/bookings` | POST |
| MyBookingsPage | `/amenity/bookings/me` | GET |
| CancelButton | `/amenity/bookings/:id/cancel` | POST |
| AmenityManagementPage | `/amenity/bookings/pending` | GET |
| ApproveButton | `/amenity/bookings/:id/approve` | POST |
| RejectBookingModal | `/amenity/bookings/:id/reject` | POST |
| BlockDatesModal | `/amenity/:id/block-dates` | POST |

---

### Cancellation Warning Flow

```
1. Resident clicks "Cancel" on a booking
2. If bookingDate is within 24 hours:
   - Show confirmation dialog:
     "Cancellation within 24 hours of your booking date.
      Are you sure you want to cancel?"
3. On confirm → POST /amenity/bookings/:id/cancel
4. On dismiss → no action
```

---

### Role-Based Rendering

| Component | Visible To |
|---|---|
| AmenityListPage + AmenityAvailabilityPage | Resident |
| MyBookingsPage | Resident |
| AmenityManagementPage | PropertyManager |
| PendingBookingsList + Approve/Reject | PropertyManager |
| BlockDatesModal | PropertyManager |
