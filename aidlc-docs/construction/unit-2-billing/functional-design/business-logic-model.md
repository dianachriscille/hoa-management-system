# Business Logic Model — Unit 2: Billing & Payments

## Flow 1: Auto Invoice Generation (BullMQ Scheduled Job)

```
1. BullMQ job triggers on 1st of month at 00:01 PHT

2. Load BillingConfig (active record)
   - Get monthlyDueAmount, dueDayOfMonth

3. Fetch all active ResidentProfile records

4. For each resident:
   a. Check if invoice already exists for current billing period
      - If exists: skip (INV-01)
   b. Create Invoice:
      - invoiceNumber = INV-{YYYY}-{MM}-{sequence}
      - amount = BillingConfig.monthlyDueAmount
      - billingPeriod = "YYYY-MM"
      - dueDate = {current month}-{dueDayOfMonth}
      - status = Unpaid

5. Log generation summary (total generated, total skipped)

6. Send push notification to each resident:
   "Your HOA dues for {month} have been generated. Amount: ₱{amount}. Due: {dueDate}"

7. Log AuditLog: action = INVOICES_GENERATED
```

---

## Flow 2: Manual Invoice Generation (Property Manager)

```
1. Property Manager submits: billingPeriod, amount (optional override)

2. Validate:
   - billingPeriod format valid (YYYY-MM)
   - No invoices already exist for this period (or confirm override)

3. Execute same generation logic as Flow 1 for specified period

4. Return generation summary to Property Manager
```

---

## Flow 3: GCash Payment Initiation (Maya Business API)

```
1. Resident clicks "Pay Now" on invoice

2. Validate:
   - Invoice exists and belongs to resident
   - Invoice status is Unpaid or PartiallyPaid
   - No existing Pending payment for this invoice (GCASH-07)

3. Call Maya Business API:
   POST /v1/checkout/payment-requests
   Body: { amount, currency: "PHP", description: "HOA Dues {billingPeriod}", referenceNumber: invoiceId }

4. Maya returns: { checkoutId, checkoutUrl }

5. Create Payment record:
   - status = Pending
   - gcashPaymentId = checkoutId
   - gcashCheckoutUrl = checkoutUrl

6. Schedule BullMQ delayed job (30 min):
   - If payment still Pending after 30 min → set status = Failed

7. Return checkoutUrl to frontend
   - Frontend redirects resident to Maya checkout
```

---

## Flow 4: Maya Webhook Handler

```
1. POST /billing/webhooks/maya received

2. Verify webhook signature:
   - HMAC-SHA256(payload, MAYA_WEBHOOK_SECRET) must match X-Signature header
   - If invalid: return 400, log security warning

3. Parse webhook event type:

   IF event = "PAYMENT_SUCCESS":
     a. Find Payment by gcashPaymentId
     b. Set Payment.status = Completed, Payment.paidAt = now(), Payment.gcashReferenceNumber = webhook.referenceNumber
     c. Update Invoice:
        - Add payment amount to total paid
        - If total paid >= invoice.amount: status = Paid, paidAt = now()
        - Else: status = PartiallyPaid
     d. If Invoice.status = Paid:
        - Generate Receipt (immutable snapshot)
        - Send receipt email to resident (BullMQ job)
        - Send push notification: "Payment confirmed! Receipt #{receiptNumber}"
     e. Log AuditLog: action = PAYMENT_COMPLETED

   IF event = "PAYMENT_FAILED" or "PAYMENT_EXPIRED":
     a. Find Payment by gcashPaymentId
     b. Set Payment.status = Failed
     c. Invoice status unchanged
     d. Log AuditLog: action = PAYMENT_FAILED

4. Return 200 to Maya (always — to prevent retries on processing errors)
```

---

## Flow 5: Manual Payment Recording (Property Manager)

```
1. Property Manager submits: invoiceId, amount, paymentMethod, referenceNumber?, notes?

2. Validate:
   - Invoice exists
   - Invoice is not already Paid
   - amount > 0 and <= remaining balance

3. Create Payment record:
   - status = Completed
   - paymentMethod = Manual
   - recordedBy = Property Manager userId
   - paidAt = now()

4. Update Invoice:
   - If total paid >= invoice.amount: status = Paid, paidAt = now()
   - Else: status = PartiallyPaid

5. If Invoice.status = Paid:
   - Generate Receipt
   - Send receipt email to resident (BullMQ job)
   - Send push notification to resident

6. Log AuditLog: action = MANUAL_PAYMENT_RECORDED
```

---

## Flow 6: Overdue Detection Job (Daily BullMQ)

```
1. BullMQ job triggers daily at 08:00 PHT

2. Query all invoices where:
   - status IN (Unpaid, PartiallyPaid)
   - dueDate < today

3. For each overdue invoice:
   a. Set status = Overdue (if not already)

4. Query all Overdue invoices where:
   - (lastReminderSentAt IS NULL AND daysOverdue >= 7)
   OR (lastReminderSentAt IS NOT NULL AND daysSinceLastReminder >= 7)

5. For each qualifying invoice:
   a. Send push notification to resident:
      "Your HOA dues for {billingPeriod} are overdue. Please settle ₱{remainingBalance} immediately."
   b. Send email reminder
   c. Update Invoice.lastReminderSentAt = now(), Invoice.reminderCount++

6. Query invoices where daysOverdue >= 30:
   - Notify Property Manager: "Unit {unitNumber} has an invoice overdue by 30+ days"

7. Log AuditLog: action = OVERDUE_REMINDERS_SENT, metadata = { count }
```

---

## Flow 7: View Billing History (Resident)

```
1. Resident navigates to Billing

2. Fetch all invoices for resident (ordered by billingPeriod DESC)
   - Include: invoiceNumber, billingPeriod, amount, status, dueDate, paidAt

3. Resident clicks on invoice:
   - Show invoice detail: breakdown, payment history, receipt download link (if paid)

4. If invoice is Unpaid/PartiallyPaid:
   - Show "Pay Now" button → triggers Flow 3
```
