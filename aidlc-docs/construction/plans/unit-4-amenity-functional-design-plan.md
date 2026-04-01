# Functional Design Plan — Unit 4: Amenity Booking

## Unit Scope
- Amenity CRUD and availability calendar
- Booking creation with rule enforcement (max advance days, one active booking per amenity per resident)
- Booking cancellation with 24-hour policy warning
- Date blocking by Property Manager
- Booking confirmation and reminder notifications (BullMQ)

## Stories Covered
- 4.1 View Amenity Availability
- 4.2 Book an Amenity
- 4.3 Manage Amenity Schedule
- 4.4 Cancel a Booking

## Dependencies
- Unit 1 (auth, resident profiles, notification, BullMQ)
- Unit 2 (BullMQ already set up)

---

## Part 1: Clarifying Questions

### Question 1
[Answer]: A

### Question 2
[Answer]: C

### Question 3
[Answer]: A

### Question 4
[Answer]: B

### Question 5
[Answer]: B

---

## Part 2: Execution Checklist

- [x] Step 1: Generate domain-entities.md — Amenity, Booking, BlockedDate entities
- [x] Step 2: Generate business-rules.md — booking rules, cancellation, blocking, notification rules
- [x] Step 3: Generate business-logic-model.md — availability check, booking, cancellation, blocking flows
- [x] Step 4: Generate frontend-components.md — amenity booking UI component hierarchy
