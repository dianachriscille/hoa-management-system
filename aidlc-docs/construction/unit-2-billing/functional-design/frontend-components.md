# Frontend Components — Unit 2: Billing & Payments

## Feature: billing (`src/features/billing/`)

### Component Hierarchy

```
BillingLayout
├── BillingPage (Resident)
│   ├── CurrentInvoiceCard
│   │   ├── InvoiceStatusBadge
│   │   ├── AmountDue
│   │   ├── DueDateLabel
│   │   └── PayNowButton (disabled if Paid)
│   ├── InvoiceHistoryList
│   │   └── InvoiceHistoryRow (per invoice)
│   │       ├── InvoiceStatusBadge
│   │       ├── BillingPeriodLabel
│   │       ├── AmountLabel
│   │       └── ViewDetailsButton
│   └── InvoiceDetailModal
│       ├── InvoiceInfo (number, period, amount, due date)
│       ├── PaymentHistoryList
│       │   └── PaymentRow (amount, method, date, reference)
│       └── ReceiptDownloadButton (visible if Paid)
│
├── BillingDashboardPage (Property Manager)
│   ├── BillingSummaryCards
│   │   ├── TotalGeneratedCard
│   │   ├── TotalCollectedCard
│   │   ├── TotalOutstandingCard
│   │   └── CollectionRateCard
│   ├── OverdueAgingTable
│   │   └── AgingRow (1–7d, 8–14d, 15–30d, 30+d)
│   ├── InvoiceListTable
│   │   ├── InvoiceTableRow
│   │   │   ├── UnitNumber, ResidentName
│   │   │   ├── InvoiceStatusBadge
│   │   │   ├── AmountLabel
│   │   │   └── RecordPaymentButton
│   │   └── BillingPeriodFilter
│   ├── GenerateInvoicesButton
│   └── RecordManualPaymentModal
│       ├── AmountInput
│       ├── PaymentMethodSelect (Cash / Cheque)
│       ├── ReferenceNumberInput (optional)
│       ├── NotesInput (optional)
│       └── SubmitButton
```

---

### State Management

| Component | State | Description |
|---|---|---|
| BillingPage | `{ invoices[], isLoading, selectedInvoice }` | Resident invoice list + selected detail |
| CurrentInvoiceCard | `{ isRedirecting }` | GCash redirect loading state |
| BillingDashboardPage | `{ summary, invoices[], period, isLoading }` | PM dashboard data |
| RecordManualPaymentModal | `{ isOpen, invoiceId, formData, isSubmitting, error }` | Manual payment form state |

---

### API Integration Points

| Component | Endpoint | Method |
|---|---|---|
| BillingPage | `/billing/invoices/me` | GET |
| InvoiceDetailModal | `/billing/invoices/:id` | GET |
| PayNowButton | `/billing/invoices/:id/pay` | POST |
| ReceiptDownloadButton | `/billing/receipts/:id/download` | GET |
| BillingDashboardPage | `/billing/dashboard?period=` | GET |
| InvoiceListTable | `/billing/invoices?period=&page=` | GET |
| GenerateInvoicesButton | `/billing/invoices/generate` | POST |
| RecordManualPaymentModal | `/billing/invoices/:id/manual-payment` | POST |

---

### User Interaction Flows

**GCash Payment Flow**:
1. Resident clicks "Pay Now" → POST `/billing/invoices/:id/pay`
2. Backend returns `{ checkoutUrl }`
3. Frontend shows loading spinner: "Redirecting to GCash..."
4. `window.location.href = checkoutUrl` — redirect to Maya checkout
5. After payment, Maya redirects back to `/billing?status=success` or `/billing?status=failed`
6. Frontend reads query param and shows success/failure toast
7. Invoice list refreshes automatically

**Manual Payment Flow (PM)**:
1. PM clicks "Record Payment" on invoice row
2. RecordManualPaymentModal opens
3. PM fills amount, method, optional reference + notes
4. On submit → POST `/billing/invoices/:id/manual-payment`
5. On success: modal closes, invoice list refreshes, success toast shown

**Generate Invoices Flow (PM)**:
1. PM clicks "Generate Invoices"
2. Confirmation dialog: "Generate invoices for {current month}? This will create invoices for all active units."
3. On confirm → POST `/billing/invoices/generate`
4. Success toast: "Generated {count} invoices for {period}"

---

### Role-Based Rendering

| Component | Visible To |
|---|---|
| BillingPage (resident view) | Resident |
| BillingDashboardPage | PropertyManager, BoardMember |
| GenerateInvoicesButton | PropertyManager only |
| RecordManualPaymentModal | PropertyManager only |
| PayNowButton | Resident only |
