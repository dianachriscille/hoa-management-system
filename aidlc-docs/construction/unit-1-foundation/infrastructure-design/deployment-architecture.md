# Deployment Architecture — Unit 1: Foundation

## Environment Overview

| Aspect | Dev | Production |
|---|---|---|
| Terraform workspace | `dev` | `prod` |
| AWS account | Shared (dev account) | Separate (prod account) recommended |
| Domain | `dev.hoa-system.com` | `hoa-system.com` |
| API domain | `api.dev.hoa-system.com` | `api.hoa-system.com` |
| SES mode | Sandbox | Production |
| ECS tasks | 1 (fixed) | 1–4 (auto-scaling) |
| RDS instance | db.t3.micro | db.t3.medium |
| Backups | 7-day retention | 7-day retention |
| CI/CD deploy | Auto on push to `dev` | Manual approval on push to `main` |

---

## Production Deployment Topology

```
Internet
    |
    v
+---------------------------+
|  AWS Route 53             |
|  app.hoa-system.com       |  --> CloudFront
|  api.hoa-system.com       |  --> API Gateway
+---------------------------+
    |                   |
    v                   v
+----------+    +------------------+
| CloudFront|    | API Gateway      |
| (CDN)    |    | HTTP API         |
| S3 Origin|    | Throttling       |
| React SPA|    | CORS policy      |
+----------+    +------------------+
                        |
                        | VPC Link
                        v
+-----------------------------------------------+
|              AWS VPC (10.0.0.0/16)            |
|                                               |
|  Public Subnets (10.0.1.0/24, 10.0.2.0/24)  |
|  +------------------------------------------+|
|  |  NAT Gateway (AZ-a)                      ||
|  +------------------------------------------+|
|                                               |
|  Private Subnets (10.0.11.0/24, 10.0.12.0/24)|
|  +------------------------------------------+|
|  |  ECS Fargate Tasks (NestJS Backend)      ||
|  |  min 1 / max 4 tasks                     ||
|  |  0.5 vCPU / 1GB RAM each                 ||
|  |  Port 3000                               ||
|  +------------------------------------------+|
|         |              |              |       |
|         v              v              v       |
|  +------------+  +----------+  +----------+  |
|  | RDS        |  | Redis    |  | Secrets  |  |
|  | PostgreSQL |  | ElastiCache| | Manager  |  |
|  | db.t3.med  |  | t3.micro |  |          |  |
|  | Port 5432  |  | Port 6379|  |          |  |
|  +------------+  +----------+  +----------+  |
+-----------------------------------------------+
         |                  |
         v                  v
   +----------+       +----------+
   | AWS SES  |       | AWS S3   |
   | (email)  |       | (files)  |
   +----------+       +----------+
         |
         v
   +----------+
   | CloudWatch|
   | Logs +   |
   | Alarms   |
   +----------+
```

---

## Container Deployment Flow

```
Developer pushes code
    |
    v
GitHub Actions (CI)
    |-- npm test (Jest)
    |-- docker build
    |-- docker push --> AWS ECR
    |-- terraform plan
    |-- [manual approval for prod]
    |-- terraform apply
    |-- aws ecs update-service (rolling update)
    v
ECS pulls new image from ECR
    |-- Starts new task
    |-- Health check: GET /health (30s interval)
    |-- On healthy: old task drained and stopped
    |-- On unhealthy: rollback to previous task definition
```

---

## Terraform Directory Structure

```
infrastructure/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   └── prod/
│       ├── main.tf
│       ├── variables.tf
│       └── terraform.tfvars
├── modules/
│   ├── network/
│   │   ├── main.tf        # VPC, subnets, IGW, NAT, route tables
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── database/
│   │   ├── main.tf        # RDS PostgreSQL, subnet group, security group
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── cache/
│   │   ├── main.tf        # ElastiCache Redis, subnet group, security group
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── storage/
│   │   ├── main.tf        # S3 buckets, bucket policies
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── backend/
│   │   ├── main.tf        # ECS cluster, task def, service, auto-scaling, ECR
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── frontend/
│   │   ├── main.tf        # S3 frontend bucket, CloudFront, ACM, Route 53
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── api-gateway/
│   │   ├── main.tf        # API Gateway HTTP API, VPC Link, routes, throttling
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── monitoring/
│   │   ├── main.tf        # CloudWatch log groups, alarms, SNS email topic
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── secrets/
│   │   ├── main.tf        # Secrets Manager secrets (values set separately)
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── iam/
│       ├── main.tf        # ECS task role, execution role, policies
│       ├── variables.tf
│       └── outputs.tf
└── backend.tf             # Terraform remote state (S3 + DynamoDB lock)
```

---

## Terraform Remote State

- **Backend**: S3 bucket `hoa-terraform-state-{account}` + DynamoDB table `hoa-terraform-locks`
- **State files**: `dev/terraform.tfstate`, `prod/terraform.tfstate`
- **Locking**: DynamoDB prevents concurrent applies

---

## Secrets Management

| Secret Name | Contents | Rotation |
|---|---|---|
| `hoa-system/dev/jwt-private-key` | RS256 private key (PEM) | Manual |
| `hoa-system/dev/jwt-public-key` | RS256 public key (PEM) | Manual |
| `hoa-system/dev/db-password` | RDS master password | Manual |
| `hoa-system/dev/ses-smtp-credentials` | SES SMTP user/pass | Manual |
| `hoa-system/prod/jwt-private-key` | RS256 private key (PEM) | Manual |
| `hoa-system/prod/jwt-public-key` | RS256 public key (PEM) | Manual |
| `hoa-system/prod/db-password` | RDS master password | Manual |
| `hoa-system/prod/ses-smtp-credentials` | SES SMTP user/pass | Manual |
