# Logical Components — Unit 1: Foundation

## Component Overview

```
+----------------------------------------------------------+
|                    FRONTEND (React/Vite)                 |
|  AuthFeature          ResidentFeature                    |
|  - LoginPage          - ProfilePage                      |
|  - RegisterPage       - DirectoryPage (PM only)          |
|  - AuthContext        - DataPrivacyPage                  |
|  - Axios interceptor  - TanStack Query cache             |
|    (JWT refresh)                                         |
+----------------------------------------------------------+
                          |  REST + HTTPS
                          v
+----------------------------------------------------------+
|              AWS API Gateway (HTTP API)                  |
|  Rate limiting: 100 req/min per IP on /auth/*            |
|  SSL termination (ACM certificate)                       |
+----------------------------------------------------------+
                          |
                          v
+----------------------------------------------------------+
|           AWS ECS Fargate (NestJS Backend)               |
|  Auto-scale: min 1 / max 4 tasks                         |
|                                                          |
|  +--------------------+  +---------------------------+   |
|  |   AuthModule       |  |   ResidentModule          |   |
|  |  - AuthController  |  |  - ResidentController     |   |
|  |  - AuthService     |  |  - ResidentService        |   |
|  |  - AuthRepository  |  |  - ResidentRepository     |   |
|  |  - JwtStrategy     |  |  - DataRequestService     |   |
|  |  - RolesGuard      |  +---------------------------+   |
|  |  - LocalStrategy   |                                  |
|  +--------------------+  +---------------------------+   |
|                          |   NotificationModule      |   |
|  +--------------------+  |  (email only, Unit 1)     |   |
|  |   FileModule       |  |  - EmailService (SES)     |   |
|  |  - PresignedUrl    |  |  - BullMQ email queue     |   |
|  |  - FileMetadata    |  +---------------------------+   |
|  +--------------------+                                  |
|                                                          |
|  +--------------------+  +---------------------------+   |
|  |   AuditService     |  |   JobSchedulerService     |   |
|  |  (cross-cutting)   |  |  - Token cleanup job      |   |
|  |  - Append-only log |  |  - PII deletion job       |   |
|  +--------------------+  +---------------------------+   |
|                                                          |
|  Global: RolesGuard, ExceptionFilter, ValidationPipe     |
+----------------------------------------------------------+
          |                    |                |
          v                    v                v
+------------------+  +---------------+  +----------+
| AWS RDS          |  | AWS           |  | AWS S3   |
| PostgreSQL 15    |  | ElastiCache   |  |          |
| db.t3.medium     |  | Redis 7       |  | Buckets: |
| (prod)           |  | cache.t3.micro|  | - uploads|
| Single-AZ        |  |               |  | - exports|
| Encrypted        |  | Sessions      |  | SSE-S3   |
| Daily backups    |  | BullMQ queues |  | Pre-sign |
+------------------+  | Job locks     |  +----------+
                       +---------------+
          |
          v
+----------------------------------------------------------+
|                  External Services                       |
|  AWS SES (email)    AWS Secrets Manager (secrets)        |
|  AWS CloudWatch (logs + metrics + alarms)                |
+----------------------------------------------------------+
```

---

## Logical Component Responsibilities

| Component | NFR Patterns Applied |
|---|---|
| API Gateway | Rate limiting (SEC-11), SSL termination (SEC-01) |
| ECS Auto-Scaling | Scalability pattern (SCAL-02, SCAL-03) |
| AuthModule / JwtStrategy | JWT rotation, RS256, RBAC guard (SEC-04, RBAC-01) |
| AuthModule / LocalStrategy | Account lockout, bcrypt compare (AUTH-07, SEC-03) |
| RolesGuard | RBAC enforcement on all routes (RBAC-01 to RBAC-08) |
| ResidentModule | DPA consent, data requests, audit logging (DPA-01 to DPA-10) |
| AuditService | Immutable audit log pattern (DPA-06, DPA-07) |
| NotificationModule (email) | BullMQ retry pattern (REL-04) |
| JobSchedulerService | Scheduled PII anonymization (DPA-05, RET-02) |
| FileModule | S3 pre-signed URL pattern (PERF-01) |
| Redis (ElastiCache) | Session cache, account lockout, BullMQ queues (PERF-05, REL-03) |
| RDS PostgreSQL | Connection pooling (SCAL-05), encrypted at rest (SEC-02) |
| CloudWatch | Structured logging, alarms (MON-01 to MON-07) |
| AWS Secrets Manager | Secrets injection pattern (SEC-07) |

---

## Data Flow: Login with NFR Patterns Applied

```
1. Client --> API Gateway
   [Rate limit check: 100 req/min per IP]

2. API Gateway --> ECS Task (NestJS)
   [TLS terminated at API Gateway]

3. NestJS AuthModule
   [Check Redis lock:{userId} -- account lockout check]
   [DB lookup: User by email]
   [bcrypt.compare(password, hash) -- cost 12]
   [On success: clear Redis attempt counter]
   [Issue RS256 JWT (15min) + refresh token]
   [Store session in Redis: session:{userId}]
   [Store hashed refresh token in DB]
   [Log AuditLog: USER_LOGIN]

4. Response --> Client
   [accessToken + refreshToken returned]
   [Total time target: < 500ms p95]
```

---

## Infrastructure Component Map (Terraform)

| Terraform Resource | Module | Purpose |
|---|---|---|
| `aws_vpc` | network | Isolated VPC for all resources |
| `aws_subnet` (public x2) | network | API Gateway, ALB, NAT Gateway |
| `aws_subnet` (private x2) | network | ECS, RDS, Redis |
| `aws_internet_gateway` | network | Public internet access |
| `aws_nat_gateway` | network | Private subnet outbound access |
| `aws_db_instance` | database | RDS PostgreSQL (dev: t3.micro, prod: t3.medium) |
| `aws_elasticache_cluster` | cache | Redis (cache.t3.micro both envs) |
| `aws_s3_bucket` (uploads) | storage | Profile photos, maintenance photos |
| `aws_s3_bucket` (frontend) | frontend | React static assets |
| `aws_cloudfront_distribution` | frontend | CDN for frontend assets |
| `aws_ecs_cluster` | backend | ECS cluster |
| `aws_ecs_task_definition` | backend | NestJS container definition |
| `aws_ecs_service` | backend | ECS service with auto-scaling |
| `aws_appautoscaling_*` | backend | Auto-scaling policies (min 1, max 4) |
| `aws_apigatewayv2_api` | backend | HTTP API Gateway |
| `aws_ses_domain_identity` | email | SES domain verification |
| `aws_secretsmanager_secret` | secrets | JWT key, DB password, API keys |
| `aws_cloudwatch_metric_alarm` | monitoring | CPU, memory, RDS, ECS alarms |
| `aws_cloudwatch_log_group` | monitoring | Application log groups |
| `aws_ecr_repository` | backend | Docker image registry |
| `aws_iam_role` (ECS task) | iam | Least-privilege task execution role |
