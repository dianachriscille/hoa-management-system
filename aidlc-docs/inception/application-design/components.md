# Components — HOA Management System

## Architecture Overview
- **Pattern**: Modular Monolith
- **Frontend**: Single React responsive web app (role-based routing for all 4 personas)
- **Backend**: Single Node.js (TypeScript) application with clearly separated internal modules
- **Database**: PostgreSQL on AWS RDS (primary) + Redis on AWS ElastiCache (sessions, cache, real-time)
- **File Storage**: AWS S3 (pre-signed URL uploads)
- **Communication**: REST API + WebSockets (real-time features)

---

## Frontend Components

### FC-01: AuthModule
**Purpose**: Handles all authentication UI flows
**Responsibilities**:
- Login, registration, email verification, password reset forms
- JWT token storage and refresh logic
- Route guards based on authentication state

### FC-02: ResidentModule
**Purpose**: Resident profile and directory UI
**Responsibilities**:
- Resident self-registration and profile editing
- Resident directory view (Property Manager only)
- Role management UI (Property Manager only)

### FC-03: BillingModule
**Purpose**: Billing and payments UI
**Responsibilities**:
- Invoice list and detail views
- GCash payment redirect flow
- Payment history and receipt download
- Manual payment recording form (Property Manager)
- Billing dashboard (Property Manager)

### FC-04: MaintenanceModule
**Purpose**: Maintenance request UI
**Responsibilities**:
- Request submission form with photo upload (S3 pre-signed URL)
- Request list and status tracking (Resident)
- Request assignment and status update (Property Manager)
- Maintenance analytics view (Property Manager)

### FC-05: AmenityModule
**Purpose**: Amenity booking UI
**Responsibilities**:
- Availability calendar per amenity
- Booking creation and cancellation (Resident)
- Amenity schedule management and date blocking (Property Manager)

### FC-06: DocumentModule
**Purpose**: Document repository UI
**Responsibilities**:
- Document browse by category and search
- Document download (Resident)
- Document upload, update, delete (Property Manager / Board Member)
- Google Drive / SharePoint integration picker

### FC-07: CommunicationModule
**Purpose**: Announcements, polls, feedback, and events UI
**Responsibilities**:
- Announcement creation and publishing (Board Member / Property Manager)
- Poll creation, voting, and results display
- Feedback form rendering and submission
- Event calendar, creation, and RSVP

### FC-08: SecurityModule
**Purpose**: Visitor pass and gate guard UI
**Responsibilities**:
- Visitor pass creation and QR code display (Resident)
- Gate guard dashboard: QR scan, manual lookup, resident verification (Gate Guard role view)
- Incident report submission (Resident and Gate Guard)
- Incident report list (Board Member / Property Manager)

### FC-09: AnalyticsModule
**Purpose**: Dashboards and reporting UI
**Responsibilities**:
- Financial dashboard (Board Member / Property Manager)
- Maintenance analytics dashboard (Property Manager)
- Resident engagement metrics dashboard (Board Member)
- Report export (PDF / CSV)

### FC-10: SharedComponents
**Purpose**: Reusable UI primitives
**Responsibilities**:
- Navigation bar, sidebar, role-based menu
- Notification bell and push notification handler
- File upload component (S3 pre-signed URL flow)
- Data tables, modals, form controls, loading states
- WebSocket connection manager (real-time status updates)

---

## Backend Modules (Modular Monolith)

### BM-01: AuthModule
**Purpose**: Authentication and authorization
**Responsibilities**:
- User registration, email verification, login, logout
- JWT access token and refresh token issuance
- Password hashing (bcrypt) and reset flow
- RBAC middleware — role enforcement on all routes
- AWS Cognito integration (optional future migration path)
- Session management via Redis

### BM-02: ResidentModule
**Purpose**: Resident and user management
**Responsibilities**:
- Resident profile CRUD
- Resident directory queries
- Role assignment and management
- Unit number validation and uniqueness enforcement
- Philippines DPA 2012 — consent recording, data access/deletion requests

### BM-03: BillingModule
**Purpose**: Invoicing and payment processing
**Responsibilities**:
- Invoice generation (monthly batch job)
- Invoice CRUD and status management (Unpaid / Partially Paid / Paid / Overdue)
- GCash payment initiation and webhook handling
- Manual payment recording
- Overdue detection and reminder scheduling
- Payment receipt generation

### BM-04: MaintenanceModule
**Purpose**: Maintenance request lifecycle management
**Responsibilities**:
- Request creation, assignment, and status transitions
- S3 pre-signed URL generation for photo uploads
- Status change notifications (WebSocket + push)
- Maintenance analytics aggregation

### BM-05: AmenityModule
**Purpose**: Amenity availability and booking management
**Responsibilities**:
- Amenity CRUD and schedule management
- Availability calendar computation
- Booking creation, validation (rules enforcement), and cancellation
- Booking conflict detection
- Booking confirmation and reminder notifications

### BM-06: DocumentModule
**Purpose**: Document repository management
**Responsibilities**:
- Google Drive / SharePoint OAuth integration
- Document metadata CRUD (title, category, external file ID)
- Document search and category filtering
- S3 pre-signed URL generation for direct uploads (fallback)

### BM-07: CommunicationModule
**Purpose**: Announcements, polls, feedback, and events
**Responsibilities**:
- Announcement CRUD and publishing
- Push notification dispatch (FCM / AWS SNS)
- SMS alert dispatch (Twilio / AWS SNS)
- Poll CRUD, vote recording, duplicate vote prevention, result computation
- Feedback form CRUD and response collection
- Event CRUD and RSVP management
- Engagement metric tracking (open rates, participation rates)

### BM-08: SecurityModule
**Purpose**: Visitor pass and incident management
**Responsibilities**:
- Visitor pass creation, QR code generation, expiry validation
- Visitor pass lookup (by QR code or manual search)
- Resident identity verification for gate guard
- Incident report CRUD with S3 photo upload
- Incident report dashboard queries

### BM-09: AnalyticsModule
**Purpose**: Reporting and dashboard data aggregation
**Responsibilities**:
- Financial report aggregation (budget vs. actual, collection rate, overdue aging)
- Maintenance performance aggregation (open/closed counts, avg resolution time)
- Engagement metrics aggregation (poll participation, RSVP rate, announcement open rate)
- PDF and CSV report generation

### BM-10: NotificationModule
**Purpose**: Centralized notification dispatch
**Responsibilities**:
- Push notification dispatch via FCM or AWS SNS
- SMS dispatch via Twilio or AWS SNS
- In-app notification storage and retrieval
- Notification preference management per resident
- Scheduled reminder job execution (overdue billing, booking reminders)

### BM-11: FileModule
**Purpose**: File upload coordination
**Responsibilities**:
- S3 pre-signed URL generation for all upload types
- File metadata storage (uploader, module reference, S3 key)
- File deletion coordination

---

## Infrastructure Components

### IC-01: AWS RDS (PostgreSQL)
**Purpose**: Primary relational data store for all modules

### IC-02: AWS ElastiCache (Redis)
**Purpose**: Session storage, real-time data cache, WebSocket presence, scheduled job queuing

### IC-03: AWS S3
**Purpose**: File storage for photos (maintenance, incidents), documents (fallback), and report exports

### IC-04: AWS API Gateway
**Purpose**: HTTP entry point, rate limiting, SSL termination

### IC-05: AWS EC2 / ECS (Fargate)
**Purpose**: Backend application hosting

### IC-06: AWS CloudFront + S3
**Purpose**: Frontend static asset hosting and CDN

### IC-07: AWS SES
**Purpose**: Transactional email (invoices, receipts, verification, reminders)

### IC-08: FCM / AWS SNS
**Purpose**: Push notifications to web browsers and mobile

### IC-09: Twilio / AWS SNS
**Purpose**: SMS alerts

### IC-10: GCash Payment Gateway
**Purpose**: Online payment processing (Philippines)

### IC-11: Google Drive / SharePoint API
**Purpose**: Document repository integration
