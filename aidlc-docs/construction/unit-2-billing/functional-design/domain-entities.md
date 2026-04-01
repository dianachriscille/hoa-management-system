# Domain Entities — Unit 2: Billing & Payments

## Entity: BillingConfig

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| monthlyDueAmount | decimal(10,2) | not null — flat fee for all units |
| dueDayOfMonth | integer | not null, 1–28 (day invoice is due each month) |
| gracePeriodDays | integer | not null, default 7 |
| isActive | boolean | default true |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

**Notes**: Single active config record. Property Manager can update the monthly due amount.

---

## Entity: Invoice

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| invoiceNumber | string | unique, auto-generated (e.g., INV-2025-07-001) |
| residentProfileId | UUID | FK → ResidentProfile.id, not null |
| userId | UUID | FK → User.id, not null |
| billingPeriod | string | not null (e.g., "2025-07") |
| amount | decimal(10,2) | not null |
| status | enum | Unpaid, PartiallyPaid, Paid, Overdue |
| dueDate | date | not null |
| paidAt | timestamp | nullable |
| lastReminderSentAt | timestamp | nullable |
| reminderCount | integer | default 0 |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

**Relationships**:
- One Invoice → Many Payment
- One Invoice → One Receipt (when fully paid)

---

## Entity: Payment

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| invoiceId | UUID | FK → Invoice.id, not null |
| amount | decimal(10,2) | not null |
| paymentMethod | enum | GCash, Manual |
| status | enum | Pending, Completed, Failed |
| gcashReferenceNumber | string | nullable (from Maya webhook) |
| gcashPaymentId | string | nullable (Maya transaction ID) |
| gcashCheckoutUrl | string | nullable (Maya checkout redirect URL) |
| recordedBy | UUID | FK → User.id, nullable (for manual payments) |
| notes | string | nullable (for manual payments) |
| paidAt | timestamp | nullable |
| createdAt | timestamp | auto |

---

## Entity: Receipt

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| receiptNumber | string | unique, auto-generated (e.g., RCP-2025-07-001) |
| invoiceId | UUID | FK → Invoice.id, unique |
| residentName | string | not null (snapshot at time of payment) |
| unitNumber | string | not null (snapshot) |
| billingPeriod | string | not null |
| amountPaid | decimal(10,2) | not null |
| paymentMethod | enum | GCash, Manual |
| referenceNumber | string | nullable |
| paidAt | timestamp | not null |
| createdAt | timestamp | auto |

**Notes**: Immutable snapshot — never updated after creation.

---

## Enumerations

### InvoiceStatus
- `Unpaid` — generated, not yet paid
- `PartiallyPaid` — partial manual payment recorded
- `Paid` — fully paid
- `Overdue` — past due date and unpaid/partially paid

### PaymentMethod
- `GCash` — paid via Maya Business API
- `Manual` — cash/cheque recorded by Property Manager

### PaymentStatus
- `Pending` — GCash checkout initiated, awaiting webhook
- `Completed` — payment confirmed
- `Failed` — payment failed or expired

---

## Entity Relationships

```
BillingConfig (1) -------- (N) Invoice  [amount copied at generation time]
ResidentProfile (1) ------ (N) Invoice
Invoice (1) -------------- (N) Payment
Invoice (1) -------------- (1) Receipt  [created on full payment]
```
