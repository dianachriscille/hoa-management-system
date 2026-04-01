# Infrastructure Design — Unit 1: Foundation

## Logical-to-Infrastructure Mapping

| Logical Component | AWS Service | Config (Dev) | Config (Prod) |
|---|---|---|---|
| Backend API | ECS Fargate | 0.25 vCPU / 512MB, 1 task | 0.5 vCPU / 1GB, min 1 / max 4 tasks |
| API Entry Point | API Gateway HTTP API | Single stage | Single stage + custom domain |
| Primary Database | RDS PostgreSQL 15 | db.t3.micro, Single-AZ, 20GB | db.t3.medium, Single-AZ, 50GB |
| Session / Cache / Queue | ElastiCache Redis 7 | cache.t3.micro, 1 node | cache.t3.micro, 1 node |
| File Storage | S3 | Standard storage class | Standard storage class |
| Frontend Hosting | S3 + CloudFront | S3 static website | S3 + CloudFront distribution |
| Container Registry | ECR | 1 repository | 1 repository |
| Email | SES | Sandbox mode (verified emails only) | Production mode (domain verified) |
| Secrets | Secrets Manager | Dev secrets | Prod secrets |
| DNS | Route 53 | Dev subdomain | Production domain |
| SSL/TLS | ACM | Dev certificate | Prod certificate |
| Monitoring | CloudWatch | Logs + basic alarms | Logs + alarms + dashboards |
| CI/CD | GitHub Actions | Auto-deploy on push to `dev` | Manual approval deploy to `prod` |

---

## AWS Service Specifications

### ECS Fargate — Backend
- **Cluster**: `hoa-system-{env}`
- **Service**: `hoa-backend-{env}`
- **Task Definition**: `hoa-backend`
  - Container: `hoa-backend:latest` (from ECR)
  - Port: 3000
  - Environment variables: injected from Secrets Manager
  - Log driver: `awslogs` → CloudWatch log group `/hoa-system/{env}/backend`
- **Health check**: `GET /health` — interval 30s, timeout 5s, retries 3
- **Auto-scaling** (prod only): CPU target 70%, min 1 task, max 4 tasks

### API Gateway HTTP API
- **Name**: `hoa-api-{env}`
- **Routes**: `ANY /{proxy+}` → ECS service via VPC Link
- **Throttling**: 100 req/s burst, 50 req/s steady (auth routes)
- **CORS**: Allow origin = CloudFront domain only
- **Custom domain** (prod): `api.{domain}` with ACM certificate

### RDS PostgreSQL
- **Identifier**: `hoa-db-{env}`
- **Engine**: PostgreSQL 15.x
- **Instance**: dev: `db.t3.micro` | prod: `db.t3.medium`
- **Storage**: dev: 20GB gp2 | prod: 50GB gp3 with autoscaling to 100GB
- **Multi-AZ**: disabled (both envs — enable when needed)
- **Backup**: automated daily, 7-day retention
- **Encryption**: enabled (AWS managed key)
- **Subnet group**: private subnets only
- **Security group**: allow port 5432 from ECS security group only

### ElastiCache Redis
- **Cluster ID**: `hoa-redis-{env}`
- **Engine**: Redis 7.x
- **Node type**: `cache.t3.micro` (both envs)
- **Nodes**: 1 (no replication — upgrade when needed)
- **Encryption**: at-rest and in-transit enabled
- **Subnet group**: private subnets only
- **Security group**: allow port 6379 from ECS security group only

### S3 Buckets
| Bucket | Purpose | Access |
|---|---|---|
| `hoa-uploads-{env}-{account}` | Profile photos, maintenance photos, incident photos | Pre-signed URLs only |
| `hoa-frontend-{env}-{account}` | React static assets | CloudFront OAC only |
| `hoa-exports-{env}-{account}` | Report exports (PDF/CSV) | Pre-signed URLs only |

- All buckets: public access blocked, SSE-S3 encryption, versioning disabled

### CloudFront Distribution
- **Origin**: S3 frontend bucket (OAC — Origin Access Control)
- **Default root object**: `index.html`
- **Error pages**: 404 → `/index.html` (SPA routing)
- **Cache policy**: managed CachingOptimized for static assets
- **Custom domain** (prod): `app.{domain}` with ACM certificate

### Networking (VPC)
- **CIDR**: `10.0.0.0/16`
- **Public subnets**: `10.0.1.0/24`, `10.0.2.0/24` (2 AZs — NAT Gateway, ALB)
- **Private subnets**: `10.0.11.0/24`, `10.0.12.0/24` (2 AZs — ECS, RDS, Redis)
- **Internet Gateway**: for public subnet outbound
- **NAT Gateway**: for private subnet outbound (ECS → ECR, SES, Secrets Manager)
- **VPC Link**: API Gateway → ECS private subnet

### IAM — ECS Task Role (Least Privilege)
```
Permissions:
- s3:PutObject, s3:GetObject, s3:DeleteObject → hoa-uploads-{env}-* bucket
- s3:PutObject, s3:GetObject → hoa-exports-{env}-* bucket
- ses:SendEmail → verified SES domain
- secretsmanager:GetSecretValue → hoa-system/* secrets
- logs:CreateLogStream, logs:PutLogEvents → /hoa-system/{env}/* log groups
- ecr:GetAuthorizationToken, ecr:BatchGetImage → ECR repository
```

### CloudWatch Alarms
| Alarm | Metric | Threshold | Action |
|---|---|---|---|
| ECS CPU High | ECS CPUUtilization | > 80% for 5 min | Email alert |
| ECS Memory High | ECS MemoryUtilization | > 85% for 5 min | Email alert |
| ECS Task Stopped | ECS TaskCount | < desired count | Email alert |
| RDS CPU High | RDS CPUUtilization | > 80% for 5 min | Email alert |
| RDS Storage Low | RDS FreeStorageSpace | < 20% | Email alert |
| API 5xx Errors | API Gateway 5XXError | > 10 in 5 min | Email alert |

### GitHub Actions CI/CD Pipeline
```
On push to `dev` branch:
  1. Run tests (Jest)
  2. Build Docker image
  3. Push to ECR (dev tag)
  4. Run Terraform plan (dev workspace)
  5. Apply Terraform (dev workspace)
  6. Deploy new ECS task definition

On push to `main` branch:
  1. Run tests
  2. Build Docker image
  3. Push to ECR (prod tag)
  4. Run Terraform plan (prod workspace)
  5. Manual approval gate
  6. Apply Terraform (prod workspace)
  7. Deploy new ECS task definition (blue/green via ECS rolling update)
```
