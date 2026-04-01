# Functional Design Plan — Unit 2: Billing & Payments

## Unit Scope
- Monthly invoice generation (batch job via BullMQ)
- Invoice CRUD and status management (Unpaid / Partially Paid / Paid / Overdue)
- GCash payment initiation and webhook handling
- Manual payment recording by Property Manager
- Overdue detection and automated reminder notifications
- Payment receipt generation and email delivery
- Billing dashboard (Property Manager)

## Stories Covered
- 2.1 View Invoice and Billing History
- 2.2 Pay HOA Dues via GCash
- 2.3 Record Manual Payment
- 2.4 Overdue Payment Reminders
- 2.5 Generate Invoice

## Dependencies
- Unit 1 (auth, resident profiles, notification email, Redis/BullMQ, RDS)

---

## Part 1: Clarifying Questions

### Question 1
What is the billing structure for HOA dues?

A) Flat monthly fee — same amount for all units regardless of size or type
B) Variable by unit type — different amounts for different unit categories (e.g., studio, 1BR, 2BR)
C) Variable by unit size — amount calculated based on floor area
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2
What penalty or late fee applies to overdue invoices?

A) No penalty — reminders only, no additional charges
B) Fixed late fee — a fixed amount added after a set number of days overdue
C) Percentage penalty — a percentage of the outstanding balance added monthly
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3
What GCash integration method should be used?

A) GCash PayLink API — generate a payment link, redirect resident to GCash checkout
B) GCash GLife / Maya Business API — direct API integration with webhook confirmation
C) We need to research the available GCash merchant API — use a payment abstraction layer for now
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 4
What triggers the monthly invoice generation?

A) Automatic — scheduled BullMQ job runs on the 1st of every month
B) Manual — Property Manager clicks "Generate Invoices" in the dashboard
C) Both — auto-scheduled with option for manual trigger
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Question 5
What information should appear on the payment receipt?

A) Basic — invoice number, amount paid, date, payment method
B) Detailed — invoice number, unit number, resident name, billing period, amount paid, date, payment method, reference number
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 6
How many days overdue before the first reminder is sent, and how often should reminders repeat?

A) First reminder at 7 days overdue, repeat every 7 days
B) First reminder at 3 days overdue, repeat every 3 days
C) First reminder at 1 day overdue (due date passed), repeat weekly
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Part 2: Execution Checklist
*(Executed after plan approval)*

- [x] Step 1: Generate domain-entities.md — Invoice, Payment, Receipt entities
- [x] Step 2: Generate business-rules.md — billing rules, payment rules, overdue rules, GCash rules
- [x] Step 3: Generate business-logic-model.md — invoice generation, payment, webhook, reminder flows
- [x] Step 4: Generate frontend-components.md — billing UI component hierarchy, state, forms
