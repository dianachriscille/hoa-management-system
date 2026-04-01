# Infrastructure Design — Unit 3: Maintenance Request Tracking

## Shared Infrastructure (from Unit 1)
All compute, network, database, cache, storage, frontend, HTTP API Gateway, SES, IAM, and CI/CD resources shared from Unit 1. No re-provisioning required.

---

## New Infrastructure for Unit 3

### AWS API Gateway — WebSocket API
Unit 3 introduces real-time WebSocket support requiring a separate WebSocket API Gateway alongside the existing HTTP API.

| Resource | Config |
|---|---|
| Type | AWS API Gateway WebSocket API |
| Name | `hoa-ws-api-{env}` |
| Route | `$connect`, `$disconnect`, `$default` → ECS VPC Link |
| Auth | JWT authorizer on `$connect` route |
| Stage | `prod` / `dev` |

**Note**: socket.io handles WebSocket protocol internally — API Gateway WebSocket API acts as the entry point routing to the ECS NestJS service on port 3001 (separate from REST port 3000).

---

### ECS Task Definition Update
The existing ECS task definition gains a second port mapping for WebSocket:

| Port | Purpose |
|---|---|
| 3000 | REST API (existing) |
| 3001 | WebSocket (socket.io) — new |

Terraform update: add `portMappings` entry for 3001 in `aws_ecs_task_definition`.

---

### AWS CloudWatch — New Alarms

| Alarm | Metric | Threshold | Action |
|---|---|---|---|
| `MaintenanceWSErrors` | Custom: `HOASystem/Maintenance/WSErrors` | > 10 in 5 min | SNS email |
| `MaintenanceAutoCloseFailures` | Custom: `HOASystem/Maintenance/AutoCloseFailures` | > 0 in 5 min | SNS email |
| `MaintenanceS3UploadErrors` | Custom: `HOASystem/Maintenance/S3UploadErrors` | > 5 in 10 min | SNS email |

---

### IAM Task Role — Additional Permissions
No new S3 bucket permissions needed — maintenance photos stored in existing `hoa-uploads-{env}` bucket under `maintenance/` prefix, already covered by Unit 1 IAM policy.

---

### S3 Photo Storage Path Convention
```
hoa-uploads-{env}-{account}/
└── maintenance/
    └── {requestId}/
        ├── photo-1.jpg
        ├── photo-2.jpg
        └── photo-3.jpg
```

Pre-signed PUT URL generated with key: `maintenance/{requestId}/{uuid}.{ext}`
Pre-signed GET URL generated on request detail fetch (15-min expiry).

---

## Terraform Changes (Unit 3)

```
infrastructure/modules/api-gateway/main.tf   ← add WebSocket API
infrastructure/modules/backend/main.tf       ← add port 3001 to ECS task
infrastructure/modules/monitoring/main.tf    ← add 3 new CloudWatch alarms
```

All additive — no existing resources modified.
