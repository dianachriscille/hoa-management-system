# Code Generation Plan — Unit 1: Foundation

## Unit Context
- **Workspace root**: `C:\Users\maral\Downloads\My Project Files`
- **Project type**: Greenfield, Modular Monolith
- **Backend root**: `backend/` (NestJS + TypeScript)
- **Frontend root**: `frontend/` (React + Vite + TypeScript)
- **Infrastructure root**: `infrastructure/` (Terraform)

## Stories Implemented
- [x] 1.1 Resident Self-Registration
- [x] 1.2 Resident Profile Management
- [x] 1.3 Resident Directory Access
- [x] 1.4 User Role Management

## Dependencies
- None (Unit 1 is the foundation — no upstream unit dependencies)

---

## Generation Steps

### Project Structure Setup
- [ ] Step 1: Create backend project scaffold (`backend/` — NestJS, TypeScript, package.json, tsconfig, ESLint, Prettier, Jest config)
- [ ] Step 2: Create frontend project scaffold (`frontend/` — React, Vite, TypeScript, Tailwind, shadcn/ui, package.json, tsconfig)
- [ ] Step 3: Create infrastructure project scaffold (`infrastructure/` — Terraform modules directory structure, backend.tf, root variables)

### Backend — Database & Config
- [ ] Step 4: Create database migration — User table (`backend/src/database/migrations/`)
- [ ] Step 5: Create database migration — ResidentProfile table
- [ ] Step 6: Create database migration — ConsentRecord table
- [ ] Step 7: Create database migration — DataRequest table
- [ ] Step 8: Create database migration — AuditLog table
- [ ] Step 9: Create database migration — RefreshToken table
- [ ] Step 10: Create app config module (`backend/src/config/`)

### Backend — Auth Module
- [ ] Step 11: Create Auth DTOs (`backend/src/modules/auth/auth.dto.ts`)
- [ ] Step 12: Create Auth entities (`backend/src/modules/auth/entities/`)
- [ ] Step 13: Create Auth repository (`backend/src/modules/auth/auth.repository.ts`)
- [ ] Step 14: Create Auth service (`backend/src/modules/auth/auth.service.ts`)
- [ ] Step 15: Create JWT strategy + Guards (`backend/src/modules/auth/strategies/`, `backend/src/modules/auth/guards/`)
- [ ] Step 16: Create Auth controller (`backend/src/modules/auth/auth.controller.ts`)
- [ ] Step 17: Create Auth module (`backend/src/modules/auth/auth.module.ts`)
- [ ] Step 18: Create Auth service unit tests (`backend/src/modules/auth/auth.service.spec.ts`)

### Backend — Resident Module
- [ ] Step 19: Create Resident DTOs (`backend/src/modules/resident/resident.dto.ts`)
- [ ] Step 20: Create Resident entities (`backend/src/modules/resident/entities/`)
- [ ] Step 21: Create Resident repository (`backend/src/modules/resident/resident.repository.ts`)
- [ ] Step 22: Create Resident service (`backend/src/modules/resident/resident.service.ts`)
- [ ] Step 23: Create Resident controller (`backend/src/modules/resident/resident.controller.ts`)
- [ ] Step 24: Create Resident module (`backend/src/modules/resident/resident.module.ts`)
- [ ] Step 25: Create Resident service unit tests (`backend/src/modules/resident/resident.service.spec.ts`)

### Backend — Notification Module (email only)
- [ ] Step 26: Create Email service (`backend/src/modules/notification/email.service.ts`)
- [ ] Step 27: Create Notification module (`backend/src/modules/notification/notification.module.ts`)

### Backend — File Module
- [ ] Step 28: Create File service — S3 pre-signed URLs (`backend/src/modules/file/file.service.ts`)
- [ ] Step 29: Create File module (`backend/src/modules/file/file.module.ts`)

### Backend — Cross-Cutting
- [ ] Step 30: Create AuditService (`backend/src/common/audit/audit.service.ts`)
- [ ] Step 31: Create global exception filter (`backend/src/common/filters/`)
- [ ] Step 32: Create RBAC roles decorator + guard (`backend/src/common/guards/`)
- [ ] Step 33: Create health check controller (`backend/src/health/health.controller.ts`)
- [ ] Step 34: Create AppModule (`backend/src/app.module.ts`)
- [ ] Step 35: Create main.ts bootstrap (`backend/src/main.ts`)

### Frontend — Auth Feature
- [ ] Step 36: Create auth types and API service (`frontend/src/features/auth/`)
- [ ] Step 37: Create AuthContext + useAuth hook (`frontend/src/features/auth/`)
- [ ] Step 38: Create LoginPage + LoginForm component (`frontend/src/features/auth/`)
- [ ] Step 39: Create RegisterPage + multi-step RegisterForm (`frontend/src/features/auth/`)
- [ ] Step 40: Create EmailVerificationPage (`frontend/src/features/auth/`)
- [ ] Step 41: Create ForgotPasswordPage + ResetPasswordPage (`frontend/src/features/auth/`)

### Frontend — Resident Feature
- [ ] Step 42: Create resident types and API service (`frontend/src/features/resident/`)
- [ ] Step 43: Create ProfilePage + ProfileForm + ProfilePhoto upload (`frontend/src/features/resident/`)
- [ ] Step 44: Create DirectoryPage + DirectoryTable (PM only) (`frontend/src/features/resident/`)
- [ ] Step 45: Create DataPrivacyPage + DPA request components (`frontend/src/features/resident/`)

### Frontend — Shared
- [ ] Step 46: Create shared components (Navbar, Sidebar, role-based routing, Axios interceptor, WebSocket stub) (`frontend/src/shared/`)
- [ ] Step 47: Create App.tsx with React Router routes and role-based layout (`frontend/src/App.tsx`)

### Frontend — Tests
- [ ] Step 48: Create LoginForm unit tests (`frontend/src/features/auth/LoginForm.test.tsx`)
- [ ] Step 49: Create RegisterForm unit tests (`frontend/src/features/auth/RegisterForm.test.tsx`)

### Infrastructure
- [ ] Step 50: Create Terraform network module (`infrastructure/modules/network/`)
- [ ] Step 51: Create Terraform database module (`infrastructure/modules/database/`)
- [ ] Step 52: Create Terraform cache module (`infrastructure/modules/cache/`)
- [ ] Step 53: Create Terraform storage module (`infrastructure/modules/storage/`)
- [ ] Step 54: Create Terraform backend module — ECS, ECR, auto-scaling (`infrastructure/modules/backend/`)
- [ ] Step 55: Create Terraform frontend module — S3, CloudFront, ACM, Route 53 (`infrastructure/modules/frontend/`)
- [ ] Step 56: Create Terraform api-gateway module (`infrastructure/modules/api-gateway/`)
- [ ] Step 57: Create Terraform monitoring module — CloudWatch alarms, log groups (`infrastructure/modules/monitoring/`)
- [ ] Step 58: Create Terraform secrets module (`infrastructure/modules/secrets/`)
- [ ] Step 59: Create Terraform IAM module (`infrastructure/modules/iam/`)
- [ ] Step 60: Create Terraform environment configs — dev and prod (`infrastructure/environments/`)

### Documentation & Deployment Artifacts
- [ ] Step 61: Create Dockerfile for backend (`backend/Dockerfile`)
- [ ] Step 62: Create GitHub Actions CI/CD workflow (`.github/workflows/deploy.yml`)
- [ ] Step 63: Create code generation summary (`aidlc-docs/construction/unit-1-foundation/code/code-summary.md`)
- [ ] Step 64: Create root README.md with project setup instructions
