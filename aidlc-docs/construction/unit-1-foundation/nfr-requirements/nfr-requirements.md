# NFR Requirements — Unit 1: Foundation

## Performance

| ID | Requirement | Target |
|---|---|---|
| PERF-01 | Auth endpoint response time (login, token refresh) | < 500ms (p95) |
| PERF-02 | Profile CRUD endpoint response time | < 500ms (p95) |
| PERF-03 | Directory search response time | < 1000ms (p95) |
| PERF-04 | Database query time for auth lookups | < 100ms (p95) |
| PERF-05 | Redis session read/write latency | < 5ms (p95) |

---

## Scalability

| ID | Requirement | Target |
|---|---|---|
| SCAL-01 | Peak concurrent sessions supported | 50 concurrent sessions |
| SCAL-02 | ECS Fargate auto-scaling | Min 1 task, max 4 tasks |
| SCAL-03 | Auto-scale trigger | CPU > 70% or memory > 80% for 2 consecutive minutes |
| SCAL-04 | Scale-in cooldown | 5 minutes (prevent thrashing) |
| SCAL-05 | Database connection pooling | Max 20 connections per ECS task (PgBouncer or built-in pool) |

---

## Availability

| ID | Requirement | Target |
|---|---|---|
| AVAIL-01 | Target uptime | 99.5% (excluding scheduled maintenance) |
| AVAIL-02 | RDS deployment | Single-AZ (production); upgrade to Multi-AZ when needed |
| AVAIL-03 | RDS automated backups | Daily snapshots, 7-day retention |
| AVAIL-04 | ECS task health checks | HTTP health check on `/health` every 30 seconds |
| AVAIL-05 | ECS task restart policy | Automatic restart on failure (ECS service maintains desired count) |
| AVAIL-06 | Scheduled maintenance window | Sundays 02:00–04:00 PHT (low traffic) |

---

## Security

| ID | Requirement | Target |
|---|---|---|
| SEC-01 | All data in transit | TLS 1.2+ enforced at API Gateway and RDS |
| SEC-02 | All data at rest | RDS encryption enabled (AES-256), S3 SSE-S3 |
| SEC-03 | Password hashing | bcrypt with cost factor 12 |
| SEC-04 | JWT signing algorithm | RS256 (asymmetric) — private key in AWS Secrets Manager |
| SEC-05 | Refresh token storage | Hashed with bcrypt before DB storage |
| SEC-06 | Account lockout | 5 failed attempts → 15-minute lockout (Redis-backed) |
| SEC-07 | Secrets management | All secrets in AWS Secrets Manager; no secrets in code or env files |
| SEC-08 | IAM least privilege | ECS task roles scoped to minimum required AWS permissions |
| SEC-09 | S3 bucket policy | Public access blocked; access via pre-signed URLs only |
| SEC-10 | VPC isolation | RDS and Redis in private subnets; no public endpoints |
| SEC-11 | API rate limiting | 100 requests/minute per IP on auth endpoints (API Gateway throttling) |

---

## Compliance — Philippines DPA 2012

| ID | Requirement |
|---|---|
| DPA-01 | Explicit consent recorded before any personal data is stored |
| DPA-02 | Consent records immutable and retained indefinitely |
| DPA-03 | Data access, correction, and deletion requests handled within 15 business days |
| DPA-04 | PII anonymized within 72 hours of approved deletion request |
| DPA-05 | Billing/audit records retained 1 year post-deletion, then PII permanently removed |
| DPA-06 | All personal data access and modification events logged in AuditLog |
| DPA-07 | AuditLog retained indefinitely |
| DPA-08 | Data breach notification capability within 72 hours |

---

## Reliability

| ID | Requirement | Target |
|---|---|---|
| REL-01 | Unhandled exceptions | Caught by global error handler; logged; 500 returned to client |
| REL-02 | Database connection failure | Retry with exponential backoff (3 attempts, max 5s delay) |
| REL-03 | Redis connection failure | Graceful degradation — auth still works without Redis (fallback to DB session check) |
| REL-04 | Email delivery failure (SES) | Log failure; do not block registration; retry via BullMQ job queue |
| REL-05 | S3 pre-signed URL failure | Return error to client; do not block profile save |

---

## Maintainability

| ID | Requirement |
|---|---|
| MAINT-01 | All API endpoints documented via OpenAPI/Swagger (auto-generated from decorators) |
| MAINT-02 | Consistent error response format: `{ statusCode, message, error }` |
| MAINT-03 | Environment-based configuration via `.env` files (dev) and AWS Secrets Manager (prod) |
| MAINT-04 | ESLint + Prettier enforced in CI pipeline |
| MAINT-05 | Unit test coverage target: 80% for service and repository layers |

---

## Monitoring & Alerting

| ID | Requirement | Tool |
|---|---|---|
| MON-01 | CPU utilization alert | CloudWatch alarm > 80% for 5 min → email alert |
| MON-02 | Memory utilization alert | CloudWatch alarm > 85% for 5 min → email alert |
| MON-03 | ECS task failure alert | CloudWatch alarm on ECS task stopped events → email alert |
| MON-04 | RDS CPU alert | CloudWatch alarm > 80% for 5 min → email alert |
| MON-05 | RDS storage alert | CloudWatch alarm < 20% free storage → email alert |
| MON-06 | Application error logging | CloudWatch Logs — all unhandled errors logged with stack trace |
| MON-07 | Health check endpoint | `GET /health` returns 200 with DB and Redis connectivity status |

---

## Usability (Foundation-specific)

| ID | Requirement |
|---|---|
| USA-01 | Registration form: multi-step with progress indicator |
| USA-02 | Password strength indicator shown in real time during registration |
| USA-03 | All form validation errors shown inline (not as a single alert) |
| USA-04 | Session expiry: user shown "Your session has expired. Please log in again." before redirect |
| USA-05 | Gate Guard role view: large touch targets (min 44×44px), high contrast, readable in low light |
