# Code Generation Plan — Unit 3: Maintenance Request Tracking

## Unit Context
- **Backend module**: `backend/src/modules/maintenance/`
- **Frontend feature**: `frontend/src/features/maintenance/`
- **New**: WebSocket Gateway, socket.io Redis adapter

## Stories Implemented
- [x] 3.1 Submit Maintenance Request
- [x] 3.2 Assign Maintenance Request
- [x] 3.3 Track Maintenance Request Status
- [x] 3.4 Update Request Status

---

## Generation Steps

### Database
- [x] Step 1: Create DB migration — maintenance_request, status_history, request_photo, request_note tables + sequence

### Backend — Entities
- [x] Step 2: Create maintenance entities (MaintenanceRequest, StatusHistory, RequestPhoto, RequestNote)

### Backend — Module
- [x] Step 3: Create Maintenance DTOs
- [x] Step 4: Create MaintenanceService (CRUD, state machine, notes filtering, analytics)
- [x] Step 5: Create MaintenanceGateway (socket.io + Redis adapter + JWT auth)
- [x] Step 6: Create BullMQ Workers (AutoCloseWorker, NotificationWorker)
- [x] Step 7: Create MaintenanceController
- [x] Step 8: Create MaintenanceModule
- [x] Step 9: Create MaintenanceService unit tests

### Frontend — Maintenance Feature
- [x] Step 10: Create maintenance types
- [x] Step 11: Create maintenance API service
- [x] Step 12: Create useMaintenanceSocket hook (WebSocket + cache invalidation)
- [x] Step 13: Create MaintenanceListPage
- [x] Step 14: Create NewRequestPage + NewRequestForm (with S3 photo upload)
- [x] Step 15: Create RequestDetailPage (status timeline, notes, PM actions, resident actions)
- [x] Step 16: Register maintenance routes in App.tsx

### Documentation
- [x] Step 17: Create code summary
