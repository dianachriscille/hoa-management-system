# HOA Management System

A web-based Homeowners Association management platform built with NestJS, React, PostgreSQL, Redis, and AWS.

## Project Structure

```
├── backend/          # NestJS API (TypeScript)
├── frontend/         # React + Vite (TypeScript)
├── infrastructure/   # Terraform (AWS)
└── .github/          # GitHub Actions CI/CD
```

## Prerequisites
- Node.js 20+
- Docker
- Terraform 1.6+
- AWS CLI configured

## Local Development

### Backend
```bash
cd backend
cp .env.example .env   # fill in local values
npm install
npm run migration:run
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables (Backend)
| Variable | Description |
|---|---|
| `DB_HOST` | PostgreSQL host |
| `DB_PASSWORD` | PostgreSQL password |
| `REDIS_HOST` | Redis host |
| `JWT_PRIVATE_KEY` | RS256 private key (PEM) |
| `JWT_PUBLIC_KEY` | RS256 public key (PEM) |
| `AWS_REGION` | AWS region |
| `AWS_S3_UPLOADS_BUCKET` | S3 uploads bucket name |
| `AWS_SES_FROM_EMAIL` | Verified SES sender email |
| `FRONTEND_URL` | Frontend URL for CORS and email links |

## Infrastructure Deployment
```bash
cd infrastructure/environments/dev
terraform init
terraform apply
```

## CI/CD
- Push to `dev` → auto-deploy to dev environment
- Push to `main` → manual approval → deploy to production
