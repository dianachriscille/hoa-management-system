# NFR Requirements Plan — Unit 1: Foundation

## Unit Context
Foundation covers authentication, resident profiles, RBAC, DPA 2012 compliance, and full AWS infrastructure.
Known from requirements: medium scale (100–500 units), AWS, PostgreSQL + Redis, Terraform (dev + prod).

Please answer all `[Answer]:` questions below, then let me know when done.

---

## Part 1: NFR Questions

### Question 1
What is the target API response time for authentication endpoints (login, token refresh)?

A) < 300ms (p95) — standard for auth endpoints
B) < 500ms (p95) — acceptable for most HOA use cases
C) < 1000ms (p95) — lenient, prioritize simplicity over speed
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 2
What is the expected peak concurrent user load for the Foundation unit (login sessions active simultaneously)?

A) Low — up to 50 concurrent sessions (small HOA usage pattern)
B) Medium — up to 200 concurrent sessions
C) High — up to 500 concurrent sessions (all residents online at once)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3
What is the RDS PostgreSQL instance size for each environment?

A) Dev: db.t3.micro | Production: db.t3.small (cost-optimized for medium scale)
B) Dev: db.t3.micro | Production: db.t3.medium (balanced)
C) Dev: db.t3.small | Production: db.t3.large (performance-first)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 4
Should RDS have Multi-AZ enabled in production for high availability?

A) Yes — Multi-AZ for production (automatic failover, ~99.95% uptime)
B) No — Single-AZ for now, enable later if needed (cost saving)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 5
What is the Redis (ElastiCache) node size?

A) cache.t3.micro for both dev and production (sufficient for sessions + job queue at medium scale)
B) cache.t3.small for production, cache.t3.micro for dev
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 6
Should the backend (ECS Fargate) auto-scale based on CPU/memory?

A) Yes — auto-scaling with min 1 task, max 4 tasks (cost-efficient for medium scale)
B) Yes — auto-scaling with min 2 tasks, max 8 tasks (higher availability)
C) No — fixed 1 task (simplest, lowest cost)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 7
What monitoring and alerting setup is needed for the Foundation unit?

A) Basic — AWS CloudWatch metrics + email alerts for errors and high CPU/memory
B) Standard — CloudWatch + structured application logging (Winston/Pino) + alerts for error rate, latency, and failed logins
C) Advanced — CloudWatch + structured logging + AWS X-Ray distributed tracing
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Part 2: Execution Checklist
*(Executed after plan approval)*

- [x] Step 1: Generate nfr-requirements.md — scalability, performance, availability, security, compliance NFRs
- [x] Step 2: Generate tech-stack-decisions.md — finalized tech stack with rationale for Unit 1
