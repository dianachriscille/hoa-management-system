# Build Instructions — HOA Management System

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 20 LTS |
| npm | 10+ |
| Docker | 24+ |
| Terraform | 1.6+ |
| AWS CLI | 2.x (configured with credentials) |
| Git | 2.x |

## Environment Variables (Backend)

Copy `backend/.env.example` to `backend/.env` and fill in values:

```bash
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<your-db-password>
DB_NAME=hoa_system
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_PRIVATE_KEY=<RS256-private-key-pem>
JWT_PUBLIC_KEY=<RS256-public-key-pem>
AWS_REGION=ap-southeast-1
AWS_S3_UPLOADS_BUCKET=<bucket-name>
AWS_SES_FROM_EMAIL=<verified-ses-email>
FRONTEND_URL=http://localhost:5173
MAYA_PUBLIC_KEY=<maya-api-key>
MAYA_WEBHOOK_SECRET=<maya-webhook-secret>
GOOGLE_DRIVE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_DRIVE_CLIENT_SECRET=<google-oauth-client-secret>
FCM_SERVER_KEY=<firebase-service-account-json>
TWILIO_ACCOUNT_SID=<twilio-sid>
TWILIO_AUTH_TOKEN=<twilio-token>
TWILIO_FROM_NUMBER=<twilio-number>
QR_HMAC_SECRET=<random-32-char-secret>
```

---

## Local Development Setup

### 1. Start Local Services (Docker)

```bash
# Start PostgreSQL + Redis locally
docker run -d --name hoa-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hoa_system -p 5432:5432 postgres:15
docker run -d --name hoa-redis -p 6379:6379 redis:7
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Run Database Migrations

```bash
cd backend
npm run migration:run
```

### 4. Start Backend (Development)

```bash
cd backend
npm run start:dev
# API available at http://localhost:3000
# Swagger docs at http://localhost:3000/api/docs
```

### 5. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 6. Start Frontend (Development)

```bash
cd frontend
npm run dev
# App available at http://localhost:5173
```

---

## Production Build

### Backend

```bash
cd backend
npm run build
# Output: backend/dist/
```

### Frontend

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Docker Image (Backend)

```bash
cd backend
docker build -t hoa-backend:latest .
docker tag hoa-backend:latest <ecr-repo-url>:latest
docker push <ecr-repo-url>:latest
```

---

## Infrastructure Deployment (Terraform)

### Dev Environment

```bash
cd infrastructure/environments/dev
terraform init
terraform plan -var="db_password=<password>"
terraform apply -var="db_password=<password>"
```

### Production Environment

```bash
cd infrastructure/environments/prod
terraform init
terraform plan -var="db_password=<password>"
# Review plan carefully before applying
terraform apply -var="db_password=<password>"
```

---

## Verify Build Success

- Backend: `curl http://localhost:3000/health` → `{ "status": "ok", "database": "connected" }`
- Frontend: Open `http://localhost:5173` → Login page renders
- Swagger: Open `http://localhost:3000/api/docs` → API documentation loads

---

## Troubleshooting

### Migration fails
- Ensure PostgreSQL is running and credentials are correct
- Check `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` in `.env`

### Redis connection error
- Ensure Redis is running: `docker ps | grep redis`
- Check `REDIS_HOST` and `REDIS_PORT` in `.env`

### JWT errors
- Generate RS256 key pair: `openssl genrsa -out private.pem 2048 && openssl rsa -in private.pem -pubout -out public.pem`
- Set `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` in `.env` (single-line PEM with `\n`)
