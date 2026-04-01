# Shared Infrastructure — HOA Management System

## Overview
The following infrastructure components are provisioned in Unit 1 and shared by all subsequent units (2–8).
No unit should re-provision these resources — they reference outputs from Unit 1 Terraform modules.

---

## Shared Components

| Component | Provisioned In | Used By |
|---|---|---|
| VPC + Subnets + NAT | Unit 1 (network module) | All units |
| RDS PostgreSQL | Unit 1 (database module) | All units (separate schemas/tables per module) |
| ElastiCache Redis | Unit 1 (cache module) | Units 1, 2, 3, 6 (sessions, BullMQ, WebSocket) |
| S3 uploads bucket | Unit 1 (storage module) | Units 1, 3, 7 (photos), Unit 8 (exports) |
| S3 frontend bucket + CloudFront | Unit 1 (frontend module) | All units (single React SPA) |
| ECS Cluster + Service | Unit 1 (backend module) | All units (single NestJS monolith) |
| ECR Repository | Unit 1 (backend module) | All units (single Docker image) |
| API Gateway | Unit 1 (api-gateway module) | All units (all routes via single API) |
| AWS SES | Unit 1 (email) | Units 1, 2, 3, 4 |
| AWS Secrets Manager | Unit 1 (secrets module) | All units |
| CloudWatch Log Groups | Unit 1 (monitoring module) | All units |
| CloudWatch Alarms | Unit 1 (monitoring module) | All units |
| IAM Task Role | Unit 1 (iam module) | All units (permissions expanded per unit) |
| Terraform Remote State | Unit 1 (backend.tf) | All units |

---

## How Subsequent Units Extend Shared Infrastructure

### Database (RDS)
- Each unit adds its own tables via TypeORM migrations
- All modules share the same PostgreSQL database instance
- Migrations run at application startup (`synchronize: false`, explicit migrations only)

### ECS / Backend
- All modules are part of the single NestJS application
- New modules added to `AppModule` imports
- Single Docker image rebuilt and redeployed per unit

### S3 IAM Permissions
- Unit 1 provisions base IAM task role
- Subsequent units that need new S3 buckets or permissions update the IAM policy via Terraform

### API Gateway
- All new routes automatically proxied via `ANY /{proxy+}` catch-all route
- No API Gateway changes needed per unit unless custom throttling is required

### BullMQ (Redis)
- Unit 2 introduces BullMQ job queues on the shared Redis instance
- Subsequent units add new queue names — no infrastructure changes needed

### WebSocket (Unit 3+)
- Unit 3 adds WebSocket support to the ECS service
- Requires API Gateway WebSocket API (separate from HTTP API) — provisioned in Unit 3

### FCM / SNS / Twilio (Unit 6)
- Unit 6 provisions FCM credentials in Secrets Manager and SNS topics
- IAM task role updated to allow SNS publish

---

## Terraform Reference Pattern for Subsequent Units

Subsequent unit Terraform configurations reference Unit 1 outputs using remote state:

```hcl
data "terraform_remote_state" "foundation" {
  backend = "s3"
  config = {
    bucket = "hoa-terraform-state-${var.account_id}"
    key    = "${var.environment}/terraform.tfstate"
    region = "ap-southeast-1"
  }
}

# Reference shared VPC
vpc_id = data.terraform_remote_state.foundation.outputs.vpc_id

# Reference shared RDS
db_endpoint = data.terraform_remote_state.foundation.outputs.db_endpoint

# Reference shared Redis
redis_endpoint = data.terraform_remote_state.foundation.outputs.redis_endpoint
```
