# Unit of Work — HOA Management System

## Development Approach
- **Pattern**: Phase-grouped sequential
- **Phase 1 units** (1, 2) complete before Phase 2 units (3, 4, 5)
- **Phase 2 units** complete before Phase 3 unit (6)
- **Phase 3 unit** completes before Phase 4 units (7, 8)
- Units within the same phase may be developed in parallel

## Code Organization

### Backend (Modular Monolith — Node.js / TypeScript)
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.dto.ts
│   │   │   ├── auth.module.ts
│   │   │   └── auth.spec.ts
│   │   ├── resident/
│   │   ├── billing/
│   │   ├── maintenance/
│   │   ├── amenity/
│   │   ├── document/
│   │   ├── communication/
│   │   ├── security/
│   │   ├── analytics/
│   │   ├── notification/
│   │   └── file/
│   ├── common/
│   │   ├── middleware/
│   │   ├── guards/
│   │   ├── decorators/
│   │   ├── filters/
│   │   └── utils/
│   ├── config/
│   ├── database/
│   │   └── migrations/
│   └── main.ts
├── test/
├── package.json
└── tsconfig.json
```

### Frontend (React — TypeScript)
```
frontend/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── resident/
│   │   ├── billing/
│   │   ├── maintenance/
│   │   ├── amenity/
│   │   ├── document/
│   │   ├── communication/
│   │   ├── security/
│   │   └── analytics/
│   ├── shared/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── websocket.ts
│   │   └── types/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
└── tsconfig.json
```

### Infrastructure (AWS CDK — TypeScript)
```
infrastructure/
├── lib/
│   ├── stacks/
│   │   ├── network-stack.ts
│   │   ├── database-stack.ts
│   │   ├── cache-stack.ts
│   │   ├── storage-stack.ts
│   │   ├── backend-stack.ts
│   │   └── frontend-stack.ts
│   └── constructs/
├── bin/
│   └── app.ts
├── package.json
└── cdk.json
```

---

## Unit Definitions

---

### Unit 1 — Foundation
**Phase**: 1
**Delivery Goal**: Working authentication, resident management, and full AWS infrastructure

**Scope**:
- Full AWS infrastructure setup (IaC with AWS CDK)
- User registration, email verification, login, logout, password reset
- JWT + RBAC (Resident, Board Member, Property Manager, Gate Guard roles)
- Resident profile CRUD
- Resident directory (Property Manager)
- Role management (Property Manager)
- Philippines DPA 2012 — consent recording, data access/deletion request endpoints
- Session management (Redis)
- Transactional email (AWS SES)

**Backend Modules**: `auth`, `resident`, `notification` (email only), `file` (S3 setup)
**Frontend Features**: `auth`, `resident`
**Infrastructure**: All AWS stacks (VPC, RDS, ElastiCache, S3, ECS, CloudFront, API Gateway, SES, IAM)

**Directory Structure**:
```
backend/src/modules/auth/
backend/src/modules/resident/
backend/src/modules/notification/   ← email only in this unit
backend/src/modules/file/           ← S3 presigned URL setup
frontend/src/features/auth/
frontend/src/features/resident/
infrastructure/lib/stacks/          ← all stacks
```

---

### Unit 2 — Billing & Payments
**Phase**: 1
**Delivery Goal**: Residents can view invoices and pay via GCash; Property Manager can manage billing

**Scope**:
- Monthly invoice generation (batch job via BullMQ)
- Invoice CRUD and status management
- GCash payment initiation and webhook handling
- Manual payment recording
- Overdue detection and automated reminder notifications
- Payment receipt generation and email delivery
- Billing dashboard (Property Manager)

**Backend Modules**: `billing`, `notification` (push + email extensions)
**Frontend Features**: `billing`
**Infrastructure**: BullMQ job queue setup (Redis), GCash webhook endpoint

**Directory Structure**:
```
backend/src/modules/billing/
frontend/src/features/billing/
```

**Depends On**: Unit 1 (auth, resident profiles, notification email, Redis, RDS)

---

### Unit 3 — Maintenance Request Tracking
**Phase**: 2
**Delivery Goal**: Residents can submit and track requests; Property Manager can assign and update status in real time

**Scope**:
- Maintenance request submission with S3 photo upload (pre-signed URLs)
- Request assignment to staff
- Status lifecycle: Submitted → Assigned → In Progress → Resolved → Closed
- Real-time status updates via WebSocket
- Push notifications on status changes
- Resident resolution confirmation
- Maintenance analytics (open/closed counts, avg resolution time)

**Backend Modules**: `maintenance`, `notification` (push), WebSocketService
**Frontend Features**: `maintenance`
**Infrastructure**: WebSocket support on ECS/API Gateway

**Directory Structure**:
```
backend/src/modules/maintenance/
backend/src/common/websocket/
frontend/src/features/maintenance/
frontend/src/shared/services/websocket.ts
```

**Depends On**: Unit 1 (auth, resident, file/S3, notification)

---

### Unit 4 — Amenity Booking
**Phase**: 2
**Delivery Goal**: Residents can browse availability and book amenities; Property Manager can manage schedules

**Scope**:
- Amenity CRUD and availability calendar
- Booking creation with rule enforcement (max advance days, one active booking per amenity)
- Booking cancellation with 24-hour policy warning
- Date blocking by Property Manager
- Booking confirmation and reminder notifications (BullMQ)

**Backend Modules**: `amenity`, `notification` (push + email)
**Frontend Features**: `amenity`

**Directory Structure**:
```
backend/src/modules/amenity/
frontend/src/features/amenity/
```

**Depends On**: Unit 1 (auth, resident, notification), Unit 2 (BullMQ already set up)

---

### Unit 5 — Document Repository
**Phase**: 2
**Delivery Goal**: Residents can browse and download documents; Property Manager/Board can upload via Google Drive or SharePoint

**Scope**:
- Google Drive and SharePoint OAuth 2.0 integration
- Document metadata CRUD (title, category, external file ID)
- Document browse by category and search
- Document download via external provider URL
- S3 fallback upload for non-integrated documents

**Backend Modules**: `document`, `file` (S3 fallback)
**Frontend Features**: `document`

**Directory Structure**:
```
backend/src/modules/document/
frontend/src/features/document/
```

**Depends On**: Unit 1 (auth, resident, file/S3)

---

### Unit 6 — Communication Platform
**Phase**: 3
**Delivery Goal**: Board can post announcements, run polls, publish feedback forms, and manage events with RSVPs

**Scope**:
- Announcement creation, draft/publish, push + SMS dispatch
- Poll creation, voting, duplicate prevention, auto-close, results
- Feedback form creation and response collection
- Event creation, RSVP tracking
- Engagement metric tracking (open rates, participation rates)
- Full NotificationModule (push via FCM/SNS + SMS via Twilio/SNS)

**Backend Modules**: `communication`, `notification` (full — push + SMS)
**Frontend Features**: `communication`
**Infrastructure**: FCM / AWS SNS setup, Twilio / AWS SNS SMS setup

**Directory Structure**:
```
backend/src/modules/communication/
frontend/src/features/communication/
```

**Depends On**: Unit 1 (auth, resident, notification base), Units 3–5 complete

---

### Unit 7 — Security & Access Control
**Phase**: 4
**Delivery Goal**: Residents can issue visitor passes; Gate Guards can verify passes and submit incident reports

**Scope**:
- Visitor pass creation with QR code generation
- Visitor pass verification (QR scan + manual lookup)
- Gate Guard role view (touch-optimized, role-based routing)
- Live resident identity verification for gate guard
- Incident report submission with S3 photo upload
- Incident report dashboard (Board Member / Property Manager)

**Backend Modules**: `security`, `notification` (push for incident alerts)
**Frontend Features**: `security` (includes Gate Guard role view)

**Directory Structure**:
```
backend/src/modules/security/
frontend/src/features/security/
frontend/src/features/security/gate-guard/   ← touch-optimized sub-view
```

**Depends On**: Unit 1 (auth, resident, file/S3, notification), Unit 6 complete

---

### Unit 8 — Analytics & Reporting
**Phase**: 4
**Delivery Goal**: Board and Property Manager have real-time dashboards and can export reports

**Scope**:
- Financial dashboard (budget vs. actual, collection rate, overdue aging)
- Maintenance performance dashboard (open/closed, avg resolution time, by category)
- Resident engagement metrics (poll participation, RSVP rate, announcement open rate)
- Date range filtering on all dashboards
- PDF and CSV report export (generated server-side, stored in S3, returned via pre-signed URL)

**Backend Modules**: `analytics`, `file` (S3 export storage)
**Frontend Features**: `analytics`

**Directory Structure**:
```
backend/src/modules/analytics/
frontend/src/features/analytics/
```

**Depends On**: Units 1–7 complete (aggregates data from all modules)
