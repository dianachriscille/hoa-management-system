# Business Rules — Unit 2: Billing & Payments

## Invoice Generation Rules

| ID | Rule |
|---|---|
| INV-01 | One invoice per resident unit per billing period — duplicate generation for same unit+period is rejected |
| INV-02 | Invoice amount is copied from BillingConfig.monthlyDueAmount at generation time (not recalculated later) |
| INV-03 | Invoice due date = billing period month's due day (from BillingConfig.dueDayOfMonth) |
| INV-04 | Invoice number format: `INV-{YYYY}-{MM}-{sequence}` (e.g., INV-2025-07-001) |
| INV-05 | Auto-generation runs on the 1st of every month at 00:01 PHT via BullMQ scheduled job |
| INV-06 | Manual generation by Property Manager is allowed at any time for any billing period |
| INV-07 | Units with no active resident account are skipped during generation; skipped units logged in generation summary |
| INV-08 | On generation, all new invoices trigger a push notification to each resident |

---

## Invoice Status Rules

| ID | Rule |
|---|---|
| STAT-01 | New invoice status = Unpaid |
| STAT-02 | Invoice becomes Overdue when: current date > dueDate AND status is Unpaid or PartiallyPaid |
| STAT-03 | Overdue status is set by a daily BullMQ job that checks all unpaid invoices |
| STAT-04 | Invoice becomes Paid when total payments received = invoice amount |
| STAT-05 | Invoice becomes PartiallyPaid when total payments received > 0 but < invoice amount |
| STAT-06 | A Paid invoice cannot be modified or re-opened |

---

## Payment Rules — GCash (Maya Business API)

| ID | Rule |
|---|---|
| GCASH-01 | Resident initiates payment → backend calls Maya API to create checkout session → returns checkout URL |
| GCASH-02 | Resident is redirected to Maya checkout URL to complete payment |
| GCASH-03 | Maya sends webhook to `POST /billing/webhooks/maya` on payment completion or failure |
| GCASH-04 | Webhook payload is verified using Maya webhook signature (HMAC-SHA256) |
| GCASH-05 | On successful webhook: create Payment record (status=Completed), update Invoice status, generate Receipt, send confirmation email |
| GCASH-06 | On failed/expired webhook: create Payment record (status=Failed), Invoice remains Unpaid |
| GCASH-07 | A resident cannot initiate a new GCash payment for an invoice that already has a Pending payment — must wait for webhook or timeout (30 min) |
| GCASH-08 | Pending GCash payments expire after 30 minutes if no webhook received; status set to Failed by BullMQ cleanup job |

---

## Payment Rules — Manual

| ID | Rule |
|---|---|
| MAN-01 | Only Property Manager can record manual payments |
| MAN-02 | Manual payment fields: amount, payment method (cash/cheque), reference number (optional), notes (optional) |
| MAN-03 | Amount must be > 0 and ≤ remaining invoice balance |
| MAN-04 | Multiple manual payments allowed per invoice (partial payments) |
| MAN-05 | On manual payment: update Invoice status, generate Receipt if fully paid, send confirmation email to resident |

---

## Overdue Reminder Rules

| ID | Rule |
|---|---|
| REM-01 | First reminder sent when invoice is 7 days overdue |
| REM-02 | Subsequent reminders sent every 7 days while invoice remains Unpaid or PartiallyPaid |
| REM-03 | Reminder channels: push notification + email |
| REM-04 | Property Manager is notified when an invoice is 30 days overdue |
| REM-05 | No reminder sent to residents who have already paid |
| REM-06 | Reminder job runs daily at 08:00 PHT via BullMQ |
| REM-07 | Invoice.lastReminderSentAt and Invoice.reminderCount updated on each reminder dispatch |

---

## Receipt Rules

| ID | Rule |
|---|---|
| RCP-01 | Receipt generated only when invoice is fully paid (status = Paid) |
| RCP-02 | Receipt number format: `RCP-{YYYY}-{MM}-{sequence}` |
| RCP-03 | Receipt is immutable — never updated after creation |
| RCP-04 | Receipt fields: receipt number, invoice number, unit number, resident name, billing period, amount paid, payment method, reference number, paid date |
| RCP-05 | Receipt emailed to resident automatically on generation |
| RCP-06 | Receipt available for download in resident billing history |

---

## Billing Dashboard Rules (Property Manager)

| ID | Rule |
|---|---|
| DASH-01 | Dashboard shows: total invoices generated, total collected, total outstanding, total overdue for current month |
| DASH-02 | Collection rate = (total paid invoices / total invoices) × 100% |
| DASH-03 | Overdue aging: 1–7 days, 8–14 days, 15–30 days, 30+ days |
| DASH-04 | Dashboard filterable by billing period (month/year) |
| DASH-05 | Property Manager can view individual resident payment history |
