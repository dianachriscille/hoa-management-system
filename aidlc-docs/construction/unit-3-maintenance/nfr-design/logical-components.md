# Logical Components — Unit 3: Maintenance Request Tracking

## Component Overview

```
+----------------------------------------------------------+
|         FRONTEND (React — maintenance feature)           |
|  MaintenanceListPage    RequestDetailPage                |
|  NewRequestPage         MaintenanceAnalyticsPage         |
|  useMaintenanceSocket() hook (WebSocket + cache invalidate)|
+----------------------------------------------------------+
              | REST + HTTPS + WebSocket
              v
+----------------------------------------------------------+
|              AWS API Gateway → ECS Fargate               |
|                                                          |
|  +--------------------------------------------------+    |
|  |          MaintenanceModule (NestJS)              |    |
|  |                                                  |    |
|  |  MaintenanceController                           |    |
|  |  - POST /maintenance/requests                    |    |
|  |  - GET  /maintenance/requests/me                 |    |
|  |  - GET  /maintenance/requests/:id                |    |
|  |  - PATCH /maintenance/requests/:id/assign        |    |
|  |  - PATCH /maintenance/requests/:id/status        |    |
|  |  - POST /maintenance/requests/:id/confirm        |    |
|  |  - POST /maintenance/requests/:id/reopen         |    |
|  |  - POST /maintenance/requests/:id/notes          |    |
|  |  - GET  /maintenance/analytics                   |    |
|  |                                                  |    |
|  |  MaintenanceService                              |    |
|  |  - Request CRUD + state machine                  |    |
|  |  - Status transition guard                       |    |
|  |  - Internal notes filtering                      |    |
|  |  - Analytics aggregation (raw SQL)               |    |
|  |                                                  |    |
|  |  MaintenanceGateway (socket.io)                  |    |
|  |  - broadcastStatusUpdate(userId, payload)        |    |
|  |  - JWT auth on handshake                         |    |
|  |  - Redis adapter for multi-instance broadcast    |    |
|  +--------------------------------------------------+    |
|                                                          |
|  +--------------------------------------------------+    |
|  |         BullMQ Workers (maintenance queues)      |    |
|  |  MaintenanceAutoCloseWorker  (delayed 7d)        |    |
|  |  MaintenanceNotificationWorker (on-demand)       |    |
|  +--------------------------------------------------+    |
+----------------------------------------------------------+
        |                   |                  |
        v                   v                  v
+------------------+  +----------+  +------------------+
| AWS RDS          |  | Redis    |  | AWS S3           |
| Tables:          |  | BullMQ   |  | hoa-uploads/     |
| - maintenance_   |  | queues   |  | maintenance/     |
|   request        |  | WS rooms |  | {requestId}/     |
| - status_history |  | Redis    |  | {photoKey}       |
| - request_photo  |  | adapter  |  | (pre-signed GET) |
| - request_note   |  +----------+  +------------------+
+------------------+
```

---

## NFR Pattern Application

| Component | Patterns Applied |
|---|---|
| MaintenanceGateway | WebSocket + Redis adapter (RT-01 to RT-05) |
| MaintenanceService (status) | State machine + transition guard (STAT-01 to STAT-08) |
| MaintenanceService (notes) | Role-based response filtering (SEC-M02) |
| MaintenanceService (status update) | DB transaction pattern (REL-M04) |
| MaintenanceAutoCloseWorker | Delayed job + idempotent execution (STAT-04) |
| FileService (photos) | Pre-signed GET URLs 15-min expiry (SEC-M03) |
| MaintenanceNotificationWorker | WebSocket fallback push (REL-M01) |

---

## New Terraform Resources (Unit 3)

| Resource | Purpose |
|---|---|
| API Gateway WebSocket API | Separate WebSocket API Gateway endpoint |
| CloudWatch alarm: `MaintenanceWSErrors` | WebSocket connection error rate |
| CloudWatch alarm: `MaintenanceAutoCloseFailures` | Auto-close job failure alert |

All compute, database, Redis, and S3 resources shared from Unit 1.
