# Code Generation Plan — Unit 2: Billing & Payments

## Unit Context
- **Backend module**: `backend/src/modules/billing/`
- **Frontend feature**: `frontend/src/features/billing/`
- **Shared from Unit 1**: AppModule, RDS, Redis, BullMQ, SES, S3, ECS

## Stories Implemented
- [ ] 2.1 View Invoice and Billing History
- [ ] 2.2 Pay HOA Dues via GCash (Maya)
- [ ] 2.3 Record Manual Payment
- [ ] 2.4 Overdue Payment Reminders
- [ ] 2.5 Generate Invoice

## Dependencies
- Unit 1 (auth, resident profiles, notification email, BullMQ, RDS)

---

## Generation Steps

### Database
- [ ] Step 1: Create DB migration — billing_config, invoice, payment, receipt tables + sequences

### Backend — Entities
- [ ] Step 2: Create BillingConfig entity
- [ ] Step 3: Create Invoice entity
- [ ] Step 4: Create Payment entity
- [ ] Step 5: Create Receipt entity

### Backend — Billing Module
- [ ] Step 6: Create Billing DTOs
- [ ] Step 7: Create BillingRepository
- [ ] Step 8: Create BillingService (invoice CRUD, Maya integration, manual payment, dashboard)
- [ ] Step 9: Create MayaWebhookMiddleware (HMAC-SHA256 verification)
- [ ] Step 10: Create BillingController
- [ ] Step 11: Create BullMQ Workers (InvoiceGenerationWorker, OverdueReminderWorker, PendingPaymentCleanupWorker, ReceiptEmailWorker)
- [ ] Step 12: Create BillingModule
- [ ] Step 13: Create BillingService unit tests

### Frontend — Billing Feature
- [ ] Step 14: Create billing types
- [ ] Step 15: Create billing API service
- [ ] Step 16: Create BillingPage (resident invoice list + detail modal)
- [ ] Step 17: Create BillingDashboardPage (PM dashboard + aging table)
- [ ] Step 18: Create RecordManualPaymentModal
- [ ] Step 19: Register billing routes in App.tsx

### Documentation
- [ ] Step 20: Create code summary
