# Services — HOA Management System

## Service Layer Overview

The service layer sits between the API controllers and the data access layer.
Each backend module exposes a service class that encapsulates business logic and orchestrates cross-module interactions.

---

## SV-01: AuthService
**Orchestrates**: AuthModule, ResidentModule, NotificationModule
**Key Orchestration Flows**:
- Registration → create user → create resident profile → send verification email (NotificationModule)
- Login → validate credentials → issue JWT → store session in Redis
- Password reset → generate token → send reset email (NotificationModule)

---

## SV-02: ResidentService
**Orchestrates**: ResidentModule, AuthModule, NotificationModule
**Key Orchestration Flows**:
- Role promotion → update role → notify user of role change (NotificationModule)
- Data deletion request → anonymize PII fields → log DPA audit entry → notify user

---

## SV-03: BillingService
**Orchestrates**: BillingModule, ResidentModule, NotificationModule, FileModule
**Key Orchestration Flows**:
- Invoice generation → create invoices for all active units → send push notification to each resident (NotificationModule)
- GCash payment → initiate payment → receive webhook → mark invoice paid → generate receipt → send confirmation email (NotificationModule)
- Overdue reminder job → query overdue invoices → send push + email per resident (NotificationModule)

---

## SV-04: MaintenanceService
**Orchestrates**: MaintenanceModule, NotificationModule, FileModule
**Key Orchestration Flows**:
- Request submission → create request → generate S3 pre-signed URL (FileModule) → notify Property Manager (NotificationModule)
- Status update → update request → notify resident via WebSocket + push (NotificationModule)
- Resolution confirmation → resident confirms → close request → log resolution time for analytics

---

## SV-05: AmenityService
**Orchestrates**: AmenityModule, NotificationModule
**Key Orchestration Flows**:
- Booking creation → check availability → enforce booking rules → create booking → send confirmation (NotificationModule)
- Date blocking → block dates → cancel conflicting bookings → notify affected residents (NotificationModule)
- Booking reminder job → query upcoming bookings → send reminder notifications (NotificationModule)

---

## SV-06: DocumentService
**Orchestrates**: DocumentModule, FileModule, AuthModule
**Key Orchestration Flows**:
- Document upload → OAuth token validation → upload to Google Drive/SharePoint → store metadata → make available to residents
- Document deletion → remove from Google Drive/SharePoint → delete metadata

---

## SV-07: CommunicationService
**Orchestrates**: CommunicationModule, NotificationModule, ResidentModule
**Key Orchestration Flows**:
- Announcement publish → save announcement → dispatch push notifications to all residents (NotificationModule) → optionally dispatch SMS (NotificationModule) → track open rates
- Poll close → mark poll closed → compute results → notify residents results are available (NotificationModule)
- Event publish → save event → notify residents (NotificationModule) → track RSVPs

---

## SV-08: SecurityService
**Orchestrates**: SecurityModule, ResidentModule, NotificationModule, FileModule
**Key Orchestration Flows**:
- Visitor pass creation → validate date/time → generate QR code → store pass → return to resident
- Gate guard verification → decode QR → validate expiry → return resident/visitor info
- Incident report → create report → generate S3 pre-signed URL (FileModule) → notify Board/PM (NotificationModule)

---

## SV-09: AnalyticsService
**Orchestrates**: AnalyticsModule, BillingModule, MaintenanceModule, CommunicationModule, FileModule
**Key Orchestration Flows**:
- Financial dashboard → aggregate billing data → compute collection rate, overdue aging, budget vs. actual
- Maintenance dashboard → aggregate request data → compute open/closed counts, avg resolution time
- Engagement dashboard → aggregate poll votes, RSVPs, announcement opens → compute participation rates
- Export → generate report → upload to S3 (FileModule) → return pre-signed download URL

---

## SV-10: NotificationService
**Orchestrates**: NotificationModule, ResidentModule
**Key Orchestration Flows**:
- Push dispatch → look up resident device tokens → call FCM/SNS → store in-app notification
- SMS dispatch → look up resident phone numbers → call Twilio/SNS
- Scheduled reminders → Redis job queue → trigger at scheduled time → dispatch notification

---

## Cross-Cutting Services

### WebSocketService
**Purpose**: Manages WebSocket connections for real-time updates
**Used by**: MaintenanceService (status updates), SecurityService (gate guard live verification)
**Pattern**: Connection registry stored in Redis; broadcast to specific user or role channel

### AuditService
**Purpose**: Records all data access and modification events for DPA 2012 compliance
**Used by**: All services that handle personal data
**Pattern**: Middleware-level audit logging to a dedicated audit_log table in PostgreSQL

### JobSchedulerService
**Purpose**: Manages scheduled background jobs
**Jobs**:
- Daily overdue invoice reminder (BillingService)
- Booking reminder notifications (AmenityService)
- Poll auto-close on expiry date (CommunicationService)
**Pattern**: Redis-backed job queue (Bull/BullMQ)
