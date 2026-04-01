# Component Dependencies — HOA Management System

## Backend Module Dependency Matrix

| Module | Depends On |
|---|---|
| AuthModule | ResidentModule, NotificationModule, Redis |
| ResidentModule | FileModule, NotificationModule, PostgreSQL |
| BillingModule | ResidentModule, NotificationModule, FileModule, GCash API, PostgreSQL |
| MaintenanceModule | NotificationModule, FileModule, PostgreSQL |
| AmenityModule | NotificationModule, PostgreSQL |
| DocumentModule | FileModule, Google Drive API / SharePoint API, PostgreSQL |
| CommunicationModule | NotificationModule, ResidentModule, PostgreSQL |
| SecurityModule | ResidentModule, NotificationModule, FileModule, PostgreSQL |
| AnalyticsModule | BillingModule, MaintenanceModule, CommunicationModule, FileModule, PostgreSQL |
| NotificationModule | FCM / AWS SNS, Twilio / AWS SNS, AWS SES, Redis, PostgreSQL |
| FileModule | AWS S3, PostgreSQL |

---

## Frontend Module Dependency Matrix

| Module | Depends On |
|---|---|
| AuthModule | SharedComponents, AuthService API |
| ResidentModule | SharedComponents, ResidentService API |
| BillingModule | SharedComponents, BillingService API |
| MaintenanceModule | SharedComponents, MaintenanceService API, FileModule (S3 upload) |
| AmenityModule | SharedComponents, AmenityService API |
| DocumentModule | SharedComponents, DocumentService API |
| CommunicationModule | SharedComponents, CommunicationService API |
| SecurityModule | SharedComponents, SecurityService API, FileModule (S3 upload), WebSocket |
| AnalyticsModule | SharedComponents, AnalyticsService API |
| SharedComponents | WebSocket connection, Notification handler |

---

## Key Data Flows

### Flow 1: Resident Pays HOA Dues
```
Resident (BillingModule UI)
  --> POST /billing/invoices/:id/pay (BillingService)
  --> GCash API (payment initiation)
  --> GCash Webhook --> POST /billing/webhooks/gcash (BillingService)
  --> Update invoice status (PostgreSQL)
  --> Generate receipt (FileModule --> S3)
  --> Send confirmation email + push (NotificationModule --> SES + FCM/SNS)
```

### Flow 2: Maintenance Request Status Update (Real-Time)
```
Property Manager (MaintenanceModule UI)
  --> PATCH /maintenance/requests/:id/status (MaintenanceService)
  --> Update status + log history (PostgreSQL)
  --> Broadcast via WebSocket to Resident's channel (WebSocketService --> Redis)
  --> Send push notification (NotificationModule --> FCM/SNS)
Resident receives real-time status update in UI without page refresh
```

### Flow 3: Gate Guard Verifies Visitor Pass
```
Gate Guard (SecurityModule UI -- Gate Guard role view)
  --> Scan QR code or manual search
  --> GET /security/visitor-passes/verify?qr=... (SecurityService)
  --> Decode QR, validate expiry (PostgreSQL)
  --> Return visitor name, resident unit, validity status
Gate Guard sees VALID (green) or INVALID (red) result instantly
```

### Flow 4: Board Member Posts Announcement
```
Board Member (CommunicationModule UI)
  --> POST /communication/announcements (CommunicationService)
  --> Save announcement (PostgreSQL)
  --> Fetch all resident device tokens (ResidentModule)
  --> Dispatch push notifications (NotificationModule --> FCM/SNS)
  --> Optionally dispatch SMS (NotificationModule --> Twilio/SNS)
  --> Track open rate per resident
```

### Flow 5: Resident Uploads Maintenance Photo
```
Resident (MaintenanceModule UI)
  --> POST /files/presigned-url (FileModule)
  --> Receive S3 pre-signed URL
  --> PUT directly to S3 (browser --> AWS S3, no backend proxy)
  --> POST /maintenance/requests (MaintenanceService) with S3 file key
  --> Store request + file metadata (PostgreSQL)
```

---

## Communication Patterns

| Pattern | Used For |
|---|---|
| REST API (HTTP) | All standard CRUD operations |
| WebSocket | Real-time maintenance status updates, gate guard live verification |
| Webhook (inbound) | GCash payment confirmation |
| Background Jobs (Redis/BullMQ) | Overdue reminders, booking reminders, poll auto-close |
| S3 Pre-signed URLs | Direct browser-to-S3 file uploads |
| OAuth 2.0 | Google Drive / SharePoint document integration |

---

## External Integration Points

| Integration | Direction | Protocol | Used By |
|---|---|---|---|
| GCash API | Outbound + Inbound webhook | HTTPS REST | BillingModule |
| Google Drive API | Outbound | HTTPS REST + OAuth 2.0 | DocumentModule |
| SharePoint API | Outbound | HTTPS REST + OAuth 2.0 | DocumentModule |
| FCM (Firebase) | Outbound | HTTPS REST | NotificationModule |
| AWS SNS | Outbound | AWS SDK | NotificationModule |
| Twilio | Outbound | HTTPS REST | NotificationModule |
| AWS SES | Outbound | AWS SDK | NotificationModule |
| AWS S3 | Outbound | AWS SDK + Pre-signed URLs | FileModule |
| AWS RDS (PostgreSQL) | Internal | TCP | All backend modules |
| AWS ElastiCache (Redis) | Internal | TCP | AuthModule, WebSocketService, JobSchedulerService |
