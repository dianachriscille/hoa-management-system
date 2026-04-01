# End-to-End Test Instructions — HOA Management System

## Tool: Playwright (recommended for React SPA)

```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

---

## E2E Test Scenarios (mapped to User Stories)

### Phase 1: Core (Stories 1.1–2.5)

**Story 1.1 — Resident Self-Registration**
```
1. Navigate to /register
2. Complete all 4 steps (personal info, account, optional, consent)
3. Submit → verify success message
4. Check email for verification link
5. Click link → verify redirect to login
```

**Story 2.2 — Pay HOA Dues via GCash**
```
1. Login as Resident
2. Navigate to /billing
3. Click "Pay Now" on Unpaid invoice
4. Verify redirect to Maya checkout URL
5. Simulate webhook → verify invoice status = Paid
6. Verify receipt email received
```

### Phase 2: Operations (Stories 3.1–5.2)

**Story 3.3 — Track Maintenance Request Status (Real-Time)**
```
1. Login as Resident in Browser A
2. Login as PM in Browser B
3. Resident submits maintenance request
4. PM updates status to InProgress
5. Verify Browser A shows status update without page refresh (WebSocket)
```

**Story 4.2 — Book an Amenity**
```
1. Login as Resident
2. Navigate to /amenity
3. Select Clubhouse → view 7-day calendar
4. Click available date → confirm booking
5. Verify booking appears in My Bookings as Pending
6. Login as PM → approve booking
7. Verify booking status = Confirmed
```

### Phase 3: Engagement (Stories 6.1–6.4)

**Story 6.2 — Create and Vote in a Poll**
```
1. Login as Board Member → create poll with 3 options, closing tomorrow
2. Login as Resident → vote on option A
3. Verify results hidden while Active
4. Simulate poll close (BullMQ job)
5. Verify results visible with vote counts
```

### Phase 4: Security & Analytics (Stories 7.1–8.4)

**Story 7.2 — Verify Visitor Pass at Gate**
```
1. Login as Resident → create visitor pass for today
2. Login as Gate Guard → navigate to gate guard dashboard
3. Enter pass code → verify VALID (green) result
4. Enter expired/invalid code → verify INVALID (red) result
```

**Story 8.4 — Export Reports**
```
1. Login as PM → navigate to /analytics
2. Select Financial tab → click Export PDF
3. Verify PDF file downloads with correct filename
4. Click Export CSV → verify CSV file downloads
```

---

## Run E2E Tests

```bash
cd frontend
npx playwright test
npx playwright test --headed  # with browser visible
npx playwright show-report    # view HTML report
```

---

## User Acceptance Testing (UAT) Checklist

For each persona, verify the following workflows end-to-end:

**Resident (Maria)**
- [ ] Register and verify email
- [ ] Pay HOA dues via GCash
- [ ] Submit and track maintenance request
- [ ] Book amenity and receive confirmation
- [ ] Issue visitor pass and share QR code
- [ ] Vote in poll and view results after close

**Property Manager (Liza)**
- [ ] Generate monthly invoices
- [ ] Record manual payment
- [ ] Assign and update maintenance requests
- [ ] Approve/reject amenity bookings
- [ ] Upload document to repository
- [ ] View financial and maintenance dashboards
- [ ] Export PDF and CSV reports

**HOA Board Member (Roberto)**
- [ ] Post announcement with push notification
- [ ] Create poll and view participation metrics
- [ ] Create event and view RSVP summary
- [ ] View engagement metrics dashboard

**Gate Guard (Jun)**
- [ ] View today's expected visitors
- [ ] Verify valid visitor pass (green result)
- [ ] Verify invalid/expired pass (red result)
- [ ] Look up resident by unit number
- [ ] Submit incident report
