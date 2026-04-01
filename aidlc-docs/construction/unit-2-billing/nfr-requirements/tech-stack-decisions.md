# Tech Stack Decisions — Unit 2: Billing & Payments

## Inherited from Unit 1
All Unit 1 tech stack decisions apply: NestJS + TypeScript, React + Vite, TypeORM, BullMQ, Winston, AWS ECS/RDS/Redis/S3/SES, Terraform.

## Billing-Specific Additions

| Concern | Decision | Rationale |
|---|---|---|
| Payment gateway | Maya Business API (PayMaya) | Philippines-based, supports GCash and Maya wallet, REST API with webhook support |
| Maya SDK | `@paymaya/paymaya-sdk` or direct HTTPS calls via Axios | Direct Axios calls preferred for full control over request/response |
| Maya webhook verification | HMAC-SHA256 using `crypto` (Node.js built-in) | No additional library needed |
| PDF receipt generation | `pdfkit` (Node.js) | Lightweight, no external service dependency |
| Invoice number generation | Database sequence + formatted string | Atomic, no race conditions |
| BullMQ queues added | `invoice-generation`, `overdue-reminders`, `pending-payment-cleanup`, `receipt-email` | Separate queues for isolation and independent retry policies |
| Decimal precision | `decimal.js` library for financial calculations | Prevents floating-point errors in currency arithmetic |
