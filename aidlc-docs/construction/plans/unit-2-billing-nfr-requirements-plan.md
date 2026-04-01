# NFR Requirements Plan — Unit 2: Billing & Payments

## Inherited from Unit 1
All base NFRs (performance < 500ms p95, 50 concurrent sessions, RDS, Redis, ECS auto-scaling, CloudWatch, DPA 2012, TLS, bcrypt) apply unchanged.

## Billing-Specific Questions

### Question 1
What is the acceptable response time for the GCash/Maya payment initiation endpoint?

A) < 2 seconds (p95) — Maya API call is external, some latency expected
B) < 3 seconds (p95) — lenient, prioritize reliability over speed
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 2
Should the Maya webhook endpoint have idempotency protection (prevent duplicate processing if Maya retries the same webhook)?

A) Yes — store processed webhook IDs in Redis, reject duplicates within 24 hours
B) No — Maya guarantees single delivery; no idempotency needed
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 3
Should billing financial data (invoices, payments) be included in the DPA 2012 data deletion flow?

A) Yes — retain billing records for 1 year after account deletion (same as Unit 1 retention policy), then anonymize resident PII fields in billing records
B) No — billing records are financial records and must be retained indefinitely regardless of deletion requests
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Execution Checklist

- [x] Step 1: Generate nfr-requirements.md
- [x] Step 2: Generate tech-stack-decisions.md
