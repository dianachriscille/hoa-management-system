# Performance Test Instructions — HOA Management System

## Performance Requirements (from NFR Requirements)

| Endpoint | Target | Tool |
|---|---|---|
| Auth endpoints (login, refresh) | < 500ms p95 | k6 |
| Standard CRUD endpoints | < 500ms p95 | k6 |
| Maya payment initiation | < 3s p95 | k6 |
| WebSocket status update e2e | < 3s | k6 + socket.io |
| Analytics dashboard | < 1500ms p95 | k6 |
| Concurrent sessions | 50 concurrent | k6 |

---

## Setup

```bash
# Install k6
winget install k6 --source winget
# Or: https://k6.io/docs/getting-started/installation/
```

---

## Load Test: Authentication

```javascript
// k6/auth-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '2m',
  thresholds: { http_req_duration: ['p(95)<500'] },
};

export default function () {
  const res = http.post('http://localhost:3000/auth/login', JSON.stringify({ email: 'test@test.com', password: 'Test1234' }), { headers: { 'Content-Type': 'application/json' } });
  check(res, { 'status 200': r => r.status === 200 });
  sleep(1);
}
```

```bash
k6 run k6/auth-load-test.js
```

---

## Load Test: Concurrent Invoice List

```bash
# Test 50 concurrent residents fetching their invoices
k6 run --vus 50 --duration 1m k6/billing-load-test.js
```

---

## Stress Test: Find Breaking Point

```bash
# Gradually increase load until errors appear
k6 run --vus 10 --stage 0s:10,30s:50,60s:100,30s:0 k6/stress-test.js
```

---

## Analyze Results

- **p95 response time**: Must meet targets above
- **Error rate**: Must be < 1%
- **ECS CPU**: Monitor CloudWatch — should not exceed 70% sustained
- **RDS connections**: Monitor — should not exceed 80 (max 20/task × 4 tasks)

---

## DPA 2012 Compliance Test

```bash
# Verify data deletion flow end-to-end
1. POST /residents/me/data-requests { type: 'Deletion' }
2. PM approves via PATCH /residents/:id/data-requests/:id
3. Verify ResidentProfile PII fields anonymized within 72h
4. Verify AuditLog entry created
```
