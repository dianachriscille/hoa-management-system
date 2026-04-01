# Integration Test Instructions — HOA Management System

## Setup

```bash
# Start local services
docker run -d --name hoa-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hoa_system -p 5432:5432 postgres:15
docker run -d --name hoa-redis -p 6379:6379 redis:7

cd backend
npm run migration:run
npm run start:dev
```

---

## Key Integration Scenarios

### Scenario 1: Resident Registration → Email Verification → Login
```
1. POST /auth/register → 201 (account created, email queued)
2. GET /auth/verify-email?token={token} → 200
3. POST /auth/login → 200 with accessToken + refreshToken
4. GET /residents/me → 200 with profile data
```

### Scenario 2: Invoice Generation → GCash Payment → Receipt
```
1. POST /billing/invoices/generate (PM) → invoices created
2. GET /billing/invoices/me (Resident) → invoice visible
3. POST /billing/invoices/:id/pay → { checkoutUrl }
4. POST /billing/webhooks/maya (simulate webhook) → invoice Paid, receipt created
5. GET /billing/invoices/:id → status = Paid
```

### Scenario 3: Maintenance Request → Assignment → Real-Time Update
```
1. POST /maintenance/requests (Resident) → request created
2. PATCH /maintenance/requests/:id/assign (PM) → status = Assigned
3. WebSocket: resident receives 'maintenance:status-update' event
4. PATCH /maintenance/requests/:id/status { status: InProgress } (PM)
5. POST /maintenance/requests/:id/confirm (Resident) → status = Closed
```

### Scenario 4: Visitor Pass → Gate Guard Verification
```
1. POST /security/visitor-passes (Resident) → { pass, qrDataUrl }
2. GET /security/visitor-passes/today (Gate Guard) → pass appears
3. GET /security/visitor-passes/verify?code={passCode} → { valid: true }
4. Simulate expired pass → { valid: false, reason: 'Pass has expired' }
```

### Scenario 5: Announcement → Push Notification Dispatch
```
1. POST /communication/announcements (Board) → published
2. BullMQ worker processes push job → FCM dispatch logged
3. POST /communication/announcements/:id/read (Resident) → read tracked
4. GET /communication/metrics → announcementOpenRate > 0%
```

---

## Run Integration Tests

```bash
cd backend
npm run test:e2e
# Or use Supertest-based integration tests in backend/test/
```

## Cleanup

```bash
docker stop hoa-postgres hoa-redis
docker rm hoa-postgres hoa-redis
```
