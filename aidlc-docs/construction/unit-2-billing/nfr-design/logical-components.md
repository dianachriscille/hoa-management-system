# Logical Components — Unit 2: Billing & Payments

## Component Overview

```
+----------------------------------------------------------+
|              FRONTEND (React — billing feature)          |
|  BillingPage (Resident)    BillingDashboardPage (PM)     |
|  - InvoiceList             - SummaryCards                |
|  - PayNowButton            - OverdueAgingTable           |
|  - ReceiptDownload         - GenerateInvoicesButton      |
|                            - RecordManualPaymentModal    |
+----------------------------------------------------------+
                    | REST + HTTPS
                    v
+----------------------------------------------------------+
|              AWS API Gateway → ECS Fargate               |
|                                                          |
|  +--------------------------------------------------+    |
|  |              BillingModule (NestJS)              |    |
|  |                                                  |    |
|  |  BillingController                               |    |
|  |  - GET  /billing/invoices/me                     |    |
|  |  - GET  /billing/invoices/:id                    |    |
|  |  - POST /billing/invoices/:id/pay                |    |
|  |  - POST /billing/invoices/:id/manual-payment     |    |
|  |  - POST /billing/invoices/generate               |    |
|  |  - GET  /billing/dashboard                       |    |
|  |  - GET  /billing/receipts/:id/download           |    |
|  |  - POST /billing/webhooks/maya  [public]         |    |
|  |                                                  |    |
|  |  BillingService                                  |    |
|  |  - Invoice CRUD + status state machine           |    |
|  |  - Maya API integration (Axios + retry)          |    |
|  |  - Webhook handler + signature verification      |    |
|  |  - Manual payment recording                      |    |
|  |  - Receipt generation (pdfkit)                   |    |
|  |  - Dashboard aggregation                         |    |
|  |                                                  |    |
|  |  BillingRepository                               |    |
|  |  - Invoice, Payment, Receipt, BillingConfig CRUD |    |
|  +--------------------------------------------------+    |
|                                                          |
|  +--------------------------------------------------+    |
|  |         BullMQ Workers (billing queues)          |    |
|  |  InvoiceGenerationWorker  (monthly job)          |    |
|  |  OverdueReminderWorker    (daily job)             |    |
|  |  PendingPaymentCleanup    (every 5 min)           |    |
|  |  ReceiptEmailWorker       (on-demand)             |    |
|  +--------------------------------------------------+    |
+----------------------------------------------------------+
          |                    |                |
          v                    v                v
+------------------+  +---------------+  +----------+
| AWS RDS          |  | AWS           |  | AWS SES  |
| PostgreSQL       |  | ElastiCache   |  | (email)  |
| Tables:          |  | Redis         |  +----------+
| - billing_config |  | BullMQ queues |
| - invoice        |  | Job locks     |
| - payment        |  +---------------+
| - receipt        |
+------------------+
          |
          v
+----------------------------------------------------------+
|              External: Maya Business API                 |
|  POST /v1/checkout/payment-requests (initiate)           |
|  Webhook → POST /billing/webhooks/maya (confirm)         |
+----------------------------------------------------------+
```

---

## NFR Pattern Application per Component

| Component | Patterns Applied |
|---|---|
| BillingController (webhook) | Webhook signature verification (SEC-B01) |
| BillingService (Maya) | Axios retry + timeout (REL-B01, PERF-B01) |
| BillingService (calculations) | decimal.js precision (financial accuracy) |
| BillingService (status) | Invoice state machine (STAT-01 to STAT-06) |
| BillingRepository (receipt) | Immutable receipt pattern (RET-B01) |
| BullMQ Workers | Queue isolation + independent retry policies (REL-B03, REL-B04) |
| PendingPaymentCleanup | Delayed job expiry pattern (REL-B05) |
| CloudWatch | Billing-specific alarms (MON-B01 to MON-B04) |

---

## New Terraform Resources (Unit 2)

| Resource | Purpose |
|---|---|
| CloudWatch custom metric: `BillingMayaErrors` | Maya API failure tracking |
| CloudWatch custom metric: `BillingJobFailures` | BullMQ job failure tracking |
| CloudWatch alarm: `BillingMayaErrorAlarm` | Alert on > 5 Maya errors in 10 min |
| Secrets Manager secret: `hoa-system/{env}/maya-api-key` | Maya API credentials |
| Secrets Manager secret: `hoa-system/{env}/maya-webhook-secret` | Webhook HMAC secret |

All compute, database, and network resources shared from Unit 1.
