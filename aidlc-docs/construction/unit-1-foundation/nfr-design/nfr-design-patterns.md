# NFR Design Patterns — Unit 1: Foundation

## 1. Security Patterns

### Pattern: JWT + Refresh Token Rotation
**Addresses**: SEC-04, SEC-05, AUTH-01 to AUTH-05
**Implementation**:
- Access token: RS256, 15-minute expiry, signed with private key stored in AWS Secrets Manager
- Refresh token: random UUID, bcrypt-hashed before DB storage, 7-day expiry
- On every token refresh: old refresh token revoked, new one issued (rotation prevents replay attacks)
- On password reset: all refresh tokens for the user revoked immediately

```
Client                    Backend                   Redis / DB
  |-- POST /auth/login -->    |                         |
  |                           |-- bcrypt.compare() -->  |
  |                           |-- store session ------> Redis
  |                           |-- store refresh hash -> DB
  |<-- accessToken (15m) --   |
  |<-- refreshToken (7d) --   |
  |                           |
  |-- POST /auth/refresh -->  |
  |                           |-- verify refresh hash   DB
  |                           |-- revoke old token -->  DB
  |                           |-- issue new tokens      |
  |<-- new accessToken ----   |
  |<-- new refreshToken ---   |
```

---

### Pattern: RBAC Guard (NestJS)
**Addresses**: RBAC-01 to RBAC-08
**Implementation**:
- Custom `@Roles()` decorator applied to controllers and route handlers
- `RolesGuard` extracts JWT payload, checks `role` claim against required roles
- Applied globally via `APP_GUARD` — all routes protected by default
- `@Public()` decorator exempts specific routes (login, register, verify-email)

```typescript
// Usage pattern
@Roles(Role.PropertyManager)
@Get('/residents')
getDirectory() { ... }
```

---

### Pattern: Account Lockout (Redis-backed)
**Addresses**: AUTH-07, SEC-11
**Implementation**:
- On failed login: increment `login_attempts:{userId}` in Redis (TTL 15 min)
- On 5th failure: set `login_lock:{userId}` in Redis (TTL 15 min)
- On successful login: delete both keys
- Rate limiting at API Gateway: 100 req/min per IP on `/auth/*` routes

---

### Pattern: Secrets Injection (AWS Secrets Manager)
**Addresses**: SEC-07, INFRA-02
**Implementation**:
- ECS task definition references Secrets Manager ARNs as environment variables
- NestJS `ConfigModule` reads from `process.env` at startup
- No secrets in `.env` files committed to source control
- Terraform provisions Secrets Manager secrets; values set manually or via CI/CD

---

## 2. Resilience Patterns

### Pattern: Graceful Degradation (Redis Failure)
**Addresses**: REL-03
**Implementation**:
- Redis connection wrapped in try/catch
- On Redis unavailable: auth falls back to DB-only session validation
- Application logs warning but does not crash
- Health check endpoint reports Redis status separately from overall health

---

### Pattern: Retry with Exponential Backoff (DB Connection)
**Addresses**: REL-02
**Implementation**:
- TypeORM connection retry: 3 attempts, delays of 1s → 2s → 5s
- Applied at application bootstrap before accepting requests
- If all retries fail: application exits (ECS restarts the task automatically)

---

### Pattern: BullMQ Job Retry (Email Delivery)
**Addresses**: REL-04
**Implementation**:
- All SES email sends dispatched as BullMQ jobs (not inline)
- Job retry policy: 3 attempts, exponential backoff (1s, 5s, 30s)
- Failed jobs after max retries: moved to dead-letter queue, logged as error
- Registration not blocked by email job failure — user created first, email queued

```
Registration Request
  --> Create User (DB)
  --> Create ResidentProfile (DB)
  --> Record Consent (DB)
  --> Enqueue email job (BullMQ) ← non-blocking
  --> Return 201 to client

BullMQ Worker (async)
  --> Send verification email (SES)
  --> On failure: retry up to 3 times
  --> On max retries: log to CloudWatch
```

---

## 3. Performance Patterns

### Pattern: Redis Session Cache
**Addresses**: PERF-05, SCAL-01
**Implementation**:
- Active sessions stored in Redis: `session:{userId}` → `{ role, email, isActive }`
- JWT validation reads from Redis cache first (< 5ms) before DB lookup
- Session TTL matches refresh token expiry (7 days)
- On logout: session key deleted immediately

---

### Pattern: Database Connection Pooling
**Addresses**: PERF-04, SCAL-05
**Implementation**:
- TypeORM connection pool: max 20 connections per ECS task
- With auto-scaling max 4 tasks: max 80 total DB connections
- RDS db.t3.medium supports up to 170 connections — well within limit
- Pool configuration: `min: 2, max: 20, idleTimeoutMillis: 30000`

---

### Pattern: S3 Pre-signed URL (Direct Upload)
**Addresses**: PERF-01 (offloads file transfer from backend)
**Implementation**:
- Backend generates pre-signed PUT URL (15-minute expiry)
- Client uploads directly to S3 — backend never proxies file bytes
- Backend only stores S3 object key in DB after client confirms upload
- Reduces backend memory pressure and response time for profile photo uploads

---

## 4. Scalability Patterns

### Pattern: ECS Fargate Auto-Scaling
**Addresses**: SCAL-02, SCAL-03, SCAL-04
**Implementation**:
- ECS Service Auto Scaling policy:
  - Scale out: CPU > 70% for 2 consecutive minutes → add 1 task
  - Scale in: CPU < 30% for 10 consecutive minutes → remove 1 task
  - Min tasks: 1 | Max tasks: 4
  - Scale-in cooldown: 300 seconds
- Terraform provisions `aws_appautoscaling_target` and `aws_appautoscaling_policy`

---

## 5. Observability Patterns

### Pattern: Structured Health Check
**Addresses**: AVAIL-04, MON-07
**Implementation**:
- `GET /health` endpoint returns:
```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2025-07-14T00:00:00Z"
}
```
- ECS health check calls `/health` every 30 seconds
- Returns 503 if DB or Redis unreachable (ECS replaces unhealthy task)

---

### Pattern: CloudWatch Structured Logging
**Addresses**: MON-06
**Implementation**:
- Winston logger configured with JSON format
- Log levels: error, warn, info, debug
- All logs streamed to CloudWatch Logs via ECS log driver (`awslogs`)
- Log group: `/hoa-system/{environment}/backend`
- Unhandled exceptions caught by NestJS global exception filter → logged as `error` level

---

## 6. DPA 2012 Compliance Patterns

### Pattern: Immutable Audit Log
**Addresses**: DPA-06, DPA-07
**Implementation**:
- `AuditLog` table: INSERT only — no UPDATE or DELETE operations permitted
- DB-level constraint: no DELETE privilege granted to application DB user on `audit_log` table
- All service methods that modify personal data call `AuditService.log()` before returning

---

### Pattern: Consent Snapshot
**Addresses**: DPA-01, DPA-02
**Implementation**:
- Consent text stored verbatim in `ConsentRecord.consentText` at time of consent
- If consent wording changes in future, existing records retain original wording
- New registrations get new consent wording — full traceability maintained

---

### Pattern: Scheduled PII Anonymization
**Addresses**: DPA-05, RET-02
**Implementation**:
- On deletion request approval: immediate PII anonymization (within 72 hours)
- BullMQ delayed job scheduled for 1 year later: permanent deletion of User + ResidentProfile records
- Job stores `userId` and `scheduledAt` — does not store PII
