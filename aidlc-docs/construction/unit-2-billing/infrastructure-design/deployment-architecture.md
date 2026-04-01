# Deployment Architecture — Unit 2: Billing & Payments

## Deployment Model
Unit 2 is deployed as part of the same NestJS monolith and React SPA as Unit 1.
No new services, containers, or environments are introduced.

## Deployment Steps for Unit 2

```
1. Add BillingModule to AppModule imports (backend/src/app.module.ts)
2. Add billing feature routes to React Router (frontend/src/App.tsx)
3. Run new TypeORM migrations (billing_config, invoice, payment, receipt tables)
4. Apply Terraform changes (secrets, alarms, IAM permission)
5. Set Maya API credentials in Secrets Manager (manual step)
6. Configure Maya webhook URL in Maya merchant dashboard (manual step)
7. Deploy via GitHub Actions (same CI/CD pipeline as Unit 1)
```

## Maya Integration Setup (Manual Steps)

```
1. Create Maya Business merchant account
2. Generate API keys (public + secret) from Maya dashboard
3. Store in AWS Secrets Manager:
   aws secretsmanager put-secret-value \
     --secret-id hoa-system/prod/maya-api-key \
     --secret-string "<public-key>"
4. Configure webhook URL in Maya dashboard:
   https://api.hoa-system.com/billing/webhooks/maya
5. Copy webhook signing secret from Maya dashboard
6. Store in AWS Secrets Manager:
   aws secretsmanager put-secret-value \
     --secret-id hoa-system/prod/maya-webhook-secret \
     --secret-string "<webhook-secret>"
```

## BullMQ Queue Architecture

```
Redis (ElastiCache — shared from Unit 1)
├── Queue: invoice-generation
│   └── Scheduled: cron "0 1 1 * *" (1st of month, 00:01 PHT = 16:01 UTC)
├── Queue: overdue-reminders
│   └── Scheduled: cron "0 0 * * *" (daily, 08:00 PHT = 00:00 UTC)
├── Queue: pending-payment-cleanup
│   └── Repeatable: every 5 minutes
└── Queue: receipt-email
    └── On-demand: enqueued by BillingService on payment completion
```

## Database Migrations (Unit 2)

```
backend/src/database/migrations/
└── 1720915300000-CreateBillingTables.ts
    Creates: billing_config, invoice, payment, receipt tables
    Creates: PostgreSQL sequences for invoice_number_seq, receipt_number_seq
```
