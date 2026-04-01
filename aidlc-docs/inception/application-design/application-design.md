# Application Design — HOA Management System

## Architecture Summary

| Concern | Decision |
|---|---|
| **Backend Pattern** | Modular Monolith (Node.js / TypeScript) |
| **Frontend** | Single React responsive web app, role-based routing |
| **API** | REST + WebSockets (real-time features) |
| **Primary Database** | PostgreSQL on AWS RDS |
| **Cache / Real-time** | Redis on AWS ElastiCache |
| **File Storage** | AWS S3 (pre-signed URL direct uploads) |
| **Auth** | JWT + RBAC, bcrypt password hashing |
| **Payment** | GCash API (direct integration) |
| **Documents** | Google Drive / SharePoint OAuth integration |
| **Push Notifications** | FCM / AWS SNS (to be finalized in NFR Requirements) |
| **SMS** | Twilio / AWS SNS (to be finalized in NFR Requirements) |
| **Email** | AWS SES |
| **Background Jobs** | Redis-backed BullMQ job queue |
| **Hosting** | AWS ECS (Fargate) for backend, AWS CloudFront + S3 for frontend |

---

## Component Summary

### Frontend (10 components)
| ID | Component | Primary Persona |
|---|---|---|
| FC-01 | AuthModule | All |
| FC-02 | ResidentModule | Resident, Property Manager |
| FC-03 | BillingModule | Resident, Property Manager |
| FC-04 | MaintenanceModule | Resident, Property Manager |
| FC-05 | AmenityModule | Resident, Property Manager |
| FC-06 | DocumentModule | All |
| FC-07 | CommunicationModule | Resident, Board Member |
| FC-08 | SecurityModule | Resident, Gate Guard, Board Member, Property Manager |
| FC-09 | AnalyticsModule | Board Member, Property Manager |
| FC-10 | SharedComponents | All |

### Backend Modules (11 modules)
| ID | Module | Key Integration |
|---|---|---|
| BM-01 | AuthModule | Redis (sessions) |
| BM-02 | ResidentModule | PostgreSQL |
| BM-03 | BillingModule | GCash API, AWS SES |
| BM-04 | MaintenanceModule | AWS S3, WebSocket |
| BM-05 | AmenityModule | BullMQ (reminders) |
| BM-06 | DocumentModule | Google Drive / SharePoint |
| BM-07 | CommunicationModule | FCM/SNS, Twilio/SNS |
| BM-08 | SecurityModule | AWS S3, WebSocket |
| BM-09 | AnalyticsModule | AWS S3 (exports) |
| BM-10 | NotificationModule | FCM, SNS, Twilio, SES |
| BM-11 | FileModule | AWS S3 |

### Cross-Cutting Services
- **WebSocketService** — real-time updates (maintenance status, gate guard)
- **AuditService** — DPA 2012 compliance audit logging
- **JobSchedulerService** — BullMQ scheduled jobs (reminders, poll auto-close)

---

## Layer Architecture

```
+--------------------------------------------------+
|              React Web App (Frontend)            |
|  FC-01 to FC-10 | Role-based routing             |
|  REST calls + WebSocket connection               |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|         AWS API Gateway / Load Balancer          |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|        Node.js Modular Monolith (Backend)        |
|  BM-01 to BM-11 | Service Layer (SV-01 to SV-10)|
|  WebSocketService | AuditService | JobScheduler  |
+--------------------------------------------------+
          |                    |
          v                    v
+------------------+   +------------------+
| PostgreSQL (RDS) |   | Redis (ElastiCache)|
+------------------+   +------------------+
          |
          v
+--------------------------------------------------+
|              External Integrations               |
|  GCash | Google Drive | SharePoint | FCM | SNS   |
|  Twilio | SES | S3                               |
+--------------------------------------------------+
```

---

## Units of Work (Construction Phase)

| Unit | Modules | Phase |
|---|---|---|
| Unit 1 — Foundation | BM-01 AuthModule, BM-02 ResidentModule, FC-01, FC-02, IC-01 to IC-06 | 1 |
| Unit 2 — Billing | BM-03 BillingModule, FC-03, GCash integration | 1 |
| Unit 3 — Maintenance | BM-04 MaintenanceModule, FC-04, WebSocket | 2 |
| Unit 4 — Amenity Booking | BM-05 AmenityModule, FC-05 | 2 |
| Unit 5 — Document Repository | BM-06 DocumentModule, FC-06, Google Drive/SharePoint | 2 |
| Unit 6 — Communication | BM-07 CommunicationModule, FC-07, FCM/SMS | 3 |
| Unit 7 — Security & Access | BM-08 SecurityModule, FC-08, Gate Guard view | 4 |
| Unit 8 — Analytics | BM-09 AnalyticsModule, FC-09, PDF/CSV export | 4 |

---

## Reference Documents
- Component details: `aidlc-docs/inception/application-design/components.md`
- Method signatures: `aidlc-docs/inception/application-design/component-methods.md`
- Service orchestration: `aidlc-docs/inception/application-design/services.md`
- Dependencies & data flows: `aidlc-docs/inception/application-design/component-dependency.md`
