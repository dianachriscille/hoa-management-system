# NFR Design Patterns — Unit 2: Billing & Payments

## 1. Payment Gateway Resilience Pattern

### Pattern: Maya API Retry with Timeout
**Addresses**: REL-B01, PERF-B01
**Implementation**:
- Axios instance configured with 10s timeout for Maya API calls
- Single retry on network error or 5xx response (2s delay)
- On final failure: return 503 to client with user-friendly message
- Maya API base URL and credentials injected from Secrets Manager

```
Client --> POST /billing/invoices/:id/pay
  --> BillingService.initiateMayaPayment()
    --> Axios.post(MAYA_API_URL, payload, { timeout: 10000 })
    --> On failure: retry once after 2s
    --> On success: return { checkoutUrl }
    --> On final failure: throw ServiceUnavailableException
```

---

### Pattern: Webhook Signature Verification
**Addresses**: SEC-B01
**Implementation**:
- NestJS middleware on `POST /billing/webhooks/maya`
- Extracts `X-Callback-Signature` header
- Computes `HMAC-SHA256(rawBody, MAYA_WEBHOOK_SECRET)`
- Rejects with 400 if signature mismatch
- Uses raw body buffer (not parsed JSON) for signature computation

```typescript
// Middleware pattern
const signature = req.headers['x-callback-signature'];
const computed = crypto.createHmac('sha256', webhookSecret)
  .update(rawBody).digest('hex');
if (signature !== computed) throw new BadRequestException('Invalid signature');
```

---

### Pattern: Pending Payment Expiry (BullMQ Delayed Job)
**Addresses**: REL-B05, GCASH-08
**Implementation**:
- On Maya checkout creation: enqueue BullMQ delayed job (30 min delay)
- Job payload: `{ paymentId }`
- On job execution: check if Payment.status still Pending → set to Failed
- If already Completed/Failed: job is a no-op (idempotent)

---

## 2. Financial Calculation Pattern

### Pattern: Decimal Precision (decimal.js)
**Addresses**: Financial accuracy for currency arithmetic
**Implementation**:
- All monetary calculations use `decimal.js` — never native JS floats
- Invoice amount, payment totals, remaining balance all computed via Decimal
- Stored as `decimal(10,2)` in PostgreSQL
- Formatted as `₱{amount.toFixed(2)}` in UI

```typescript
import Decimal from 'decimal.js';
const remaining = new Decimal(invoice.amount).minus(totalPaid);
const isFullyPaid = remaining.lte(0);
```

---

## 3. BullMQ Queue Isolation Pattern

### Pattern: Separate Queues per Job Type
**Addresses**: REL-B03, REL-B04 — independent retry policies per job type
**Implementation**:

| Queue | Retry Policy | Concurrency |
|---|---|---|
| `invoice-generation` | 3 retries, exponential backoff | 1 (sequential) |
| `overdue-reminders` | 2 retries, 1h delay | 5 (parallel) |
| `pending-payment-cleanup` | 1 retry, no delay | 10 (parallel) |
| `receipt-email` | 3 retries, exponential backoff | 5 (parallel) |

- Failed jobs after max retries → dead-letter queue → CloudWatch alarm

---

## 4. Audit & Immutability Patterns

### Pattern: Immutable Receipt
**Addresses**: RET-B01, financial record integrity
**Implementation**:
- Receipt created as a snapshot — all fields copied at payment time
- No UPDATE or DELETE operations on Receipt table
- DB-level: no DELETE privilege granted to app DB user on `receipt` table
- Receipt number sequence: PostgreSQL sequence `receipt_number_seq`

---

### Pattern: Invoice Status State Machine
**Addresses**: STAT-01 to STAT-06
**Implementation**:
- Valid transitions enforced in BillingService:

```
Unpaid ──────────────────────────────> Paid
Unpaid ──────────────────────────────> PartiallyPaid
Unpaid ──────────────────────────────> Overdue
PartiallyPaid ───────────────────────> Paid
PartiallyPaid ───────────────────────> Overdue
Overdue ─────────────────────────────> Paid
Overdue ─────────────────────────────> PartiallyPaid
Paid ────────────────────────────────> [TERMINAL — no transitions]
```

- Invalid transitions throw `BadRequestException`
- All status changes logged in AuditLog

---

## 5. Observability Patterns

### Pattern: Billing-Specific CloudWatch Alarms
**Addresses**: MON-B01 to MON-B04
**Implementation**:
- Maya error rate: custom CloudWatch metric `BillingMayaErrors` incremented on each Maya API failure
- Alarm: `BillingMayaErrors > 5` in 10-minute window → SNS email alert
- Webhook errors: CloudWatch log filter on `/hoa-system/{env}/backend` for `WEBHOOK_ERROR` log entries
- Job failures: BullMQ `failed` event handler emits CloudWatch custom metric `BillingJobFailures`
