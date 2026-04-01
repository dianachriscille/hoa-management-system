# NFR Requirements — Unit 2: Billing & Payments

## Inherited NFRs from Unit 1
All Unit 1 NFRs apply: < 500ms p95 for standard endpoints, 50 concurrent sessions, RDS PostgreSQL, Redis ElastiCache, ECS auto-scaling (min 1 / max 4), CloudWatch monitoring, TLS 1.2+, encryption at rest, DPA 2012 compliance framework.

---

## Billing-Specific Performance

| ID | Requirement | Target |
|---|---|---|
| PERF-B01 | Maya payment initiation endpoint response time | < 3s (p95) — includes external Maya API call |
| PERF-B02 | Invoice list endpoint response time | < 500ms (p95) |
| PERF-B03 | Billing dashboard aggregation response time | < 1000ms (p95) |
| PERF-B04 | Maya webhook processing time | < 500ms (webhook must return 200 quickly) |

---

## Billing-Specific Reliability

| ID | Requirement |
|---|---|
| REL-B01 | Maya API call failures: retry once with 2s delay; if still failing, return error to client with "Payment service temporarily unavailable" |
| REL-B02 | Webhook processing failures: log error, return 200 to Maya (prevent retries), alert via CloudWatch alarm |
| REL-B03 | BullMQ invoice generation job failure: log error, alert Property Manager via email, do not silently fail |
| REL-B04 | BullMQ overdue reminder job failure: log error, retry next day |
| REL-B05 | Pending GCash payment cleanup job: runs every 5 minutes, marks expired Pending payments as Failed |

---

## Billing-Specific Security

| ID | Requirement |
|---|---|
| SEC-B01 | Maya webhook signature verified on every request (HMAC-SHA256) — reject unsigned webhooks with 400 |
| SEC-B02 | Maya API credentials (API key, secret) stored in AWS Secrets Manager — never in code |
| SEC-B03 | Billing endpoints accessible only to authenticated users with correct role |
| SEC-B04 | Residents can only view/pay their own invoices — cross-resident access rejected with 403 |
| SEC-B05 | Manual payment recording restricted to PropertyManager role only |

---

## Data Retention — Billing Records

| ID | Requirement |
|---|---|
| RET-B01 | Invoice, Payment, and Receipt records retained indefinitely as financial records |
| RET-B02 | On resident account deletion: billing records retained with resident PII fields anonymized only in ResidentProfile — Invoice/Payment/Receipt records kept intact with unit number as identifier |
| RET-B03 | BillingConfig history retained indefinitely for audit purposes |

---

## Monitoring — Billing-Specific

| ID | Alarm | Threshold | Action |
|---|---|---|---|
| MON-B01 | Maya API error rate | > 5 failures in 10 min | Email alert to PM + CloudWatch alarm |
| MON-B02 | Webhook processing errors | Any error | CloudWatch log + alarm |
| MON-B03 | Invoice generation job failure | Job fails | Email alert to PM |
| MON-B04 | Overdue reminder job failure | Job fails | CloudWatch alarm |
