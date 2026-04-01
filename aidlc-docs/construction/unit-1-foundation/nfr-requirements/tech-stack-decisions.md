# Tech Stack Decisions — Unit 1: Foundation

## Backend

| Concern | Decision | Rationale |
|---|---|---|
| Runtime | Node.js 20 LTS | Long-term support, strong async I/O for auth workloads |
| Language | TypeScript 5.x | Type safety, better maintainability, consistent with frontend |
| Framework | NestJS | Modular architecture aligns with Modular Monolith pattern; built-in DI, guards, interceptors, OpenAPI support |
| ORM | TypeORM | Native TypeScript support, migration tooling, works well with NestJS |
| Password hashing | bcrypt (cost factor 12) | Industry standard; cost factor 12 balances security and performance at < 500ms target |
| JWT | jsonwebtoken + RS256 | Asymmetric signing; private key in Secrets Manager; public key for verification |
| Validation | class-validator + class-transformer | NestJS-native DTO validation |
| API documentation | @nestjs/swagger | Auto-generates OpenAPI spec from decorators |
| Logging | Winston | Structured JSON logging to CloudWatch Logs |
| Job queue | BullMQ (Redis-backed) | Scheduled jobs for email retries, token cleanup, overdue reminders |
| Testing | Jest + Supertest | Unit and integration testing; 80% coverage target |

---

## Frontend

| Concern | Decision | Rationale |
|---|---|---|
| Framework | React 18 | Established ecosystem, large community, hooks-based |
| Language | TypeScript 5.x | Consistent with backend; type-safe API contracts |
| Build tool | Vite | Fast dev server and build; better DX than CRA |
| State management | React Context + TanStack Query | Context for auth state; TanStack Query for server state caching and invalidation |
| Routing | React Router v6 | Industry standard; nested routes for role-based layouts |
| UI component library | shadcn/ui + Tailwind CSS | Accessible, unstyled components + utility-first CSS; responsive by default |
| Form handling | React Hook Form + Zod | Performant forms; Zod for schema validation consistent with backend DTOs |
| HTTP client | Axios | Interceptors for JWT refresh token rotation |
| WebSocket client | socket.io-client | Matches backend socket.io server for real-time features |
| Testing | Vitest + React Testing Library | Fast unit tests; component testing aligned with user interactions |

---

## Infrastructure

| Concern | Decision | Rationale |
|---|---|---|
| IaC tool | Terraform (HCL) | Cloud-agnostic; widely adopted; strong AWS provider support |
| Environments | dev, production (separate Terraform workspaces) | Isolated state per environment |
| Backend hosting | AWS ECS Fargate | Serverless containers; no EC2 management; auto-scaling min 1 / max 4 tasks |
| Frontend hosting | AWS S3 + CloudFront | Static asset hosting with global CDN; cost-effective |
| API entry point | AWS API Gateway (HTTP API) | Rate limiting, SSL termination, request routing to ECS |
| Database | AWS RDS PostgreSQL 15 | Dev: db.t3.micro | Prod: db.t3.medium; Single-AZ; daily backups 7-day retention |
| Cache / Sessions | AWS ElastiCache Redis 7 | cache.t3.micro (both environments); sessions, BullMQ, WebSocket presence |
| File storage | AWS S3 | Pre-signed URL uploads; SSE-S3 encryption; public access blocked |
| Email | AWS SES | Transactional email (verification, receipts, alerts); cost-effective at medium scale |
| Secrets | AWS Secrets Manager | JWT private key, DB credentials, API keys; never in code |
| Container registry | AWS ECR | Docker image storage for ECS deployments |
| DNS | AWS Route 53 | Domain management and health-check routing |
| SSL certificates | AWS ACM | Free managed TLS certificates for CloudFront and API Gateway |
| Monitoring | AWS CloudWatch | Metrics, logs, alarms, email alerts |
| CI/CD | GitHub Actions | Build, test, Docker push to ECR, Terraform plan/apply, ECS deploy |

---

## Database Schema Management

| Concern | Decision |
|---|---|
| Migrations | TypeORM migrations (version-controlled in `backend/src/database/migrations/`) |
| Seeding | TypeORM seeders for dev environment (roles, test users) |
| Connection pooling | TypeORM built-in pool (max 20 connections per ECS task) |

---

## Security Libraries

| Library | Purpose |
|---|---|
| helmet | HTTP security headers (NestJS middleware) |
| express-rate-limit | Per-IP rate limiting on auth routes |
| @nestjs/throttler | NestJS-native throttling guard |
| cors | CORS policy — allow only frontend CloudFront domain |
| uuid | Secure token generation for email verification and password reset |
