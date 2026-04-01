# Domain Entities — Unit 3: Maintenance Request Tracking

## Entity: MaintenanceRequest

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| requestNumber | string | unique, auto-generated (e.g., MNT-2025-001) |
| userId | UUID | FK → User.id, not null |
| residentProfileId | UUID | FK → ResidentProfile.id, not null |
| category | enum | Plumbing, Electrical, Structural, Landscaping, Other |
| description | text | not null, max 1000 chars |
| location | string | not null, max 200 chars (e.g., "Unit 12B - Bathroom") |
| status | enum | Submitted, Assigned, InProgress, Resolved, Closed |
| assignedToUserId | UUID | FK → User.id, nullable (staff account) |
| assignedAt | timestamp | nullable |
| resolvedAt | timestamp | nullable |
| closedAt | timestamp | nullable |
| residentConfirmedAt | timestamp | nullable |
| reopenDeadline | timestamp | nullable (resolvedAt + 7 days) |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

**Relationships**:
- One MaintenanceRequest → Many StatusHistory
- One MaintenanceRequest → Many RequestPhoto (max 3)
- One MaintenanceRequest → Many RequestNote

---

## Entity: StatusHistory

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| requestId | UUID | FK → MaintenanceRequest.id, not null |
| fromStatus | enum | nullable (null for initial Submitted) |
| toStatus | enum | not null |
| changedByUserId | UUID | FK → User.id, not null |
| note | text | nullable (visible to resident) |
| createdAt | timestamp | auto |

**Notes**: Append-only — never updated or deleted. Full audit trail of all status changes.

---

## Entity: RequestPhoto

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| requestId | UUID | FK → MaintenanceRequest.id, not null |
| s3Key | string | not null (S3 object key) |
| uploadedByUserId | UUID | FK → User.id, not null |
| createdAt | timestamp | auto |

**Notes**: Max 3 photos per request enforced at service layer.

---

## Entity: RequestNote

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| requestId | UUID | FK → MaintenanceRequest.id, not null |
| authorUserId | UUID | FK → User.id, not null |
| content | text | not null |
| isInternal | boolean | not null, default false |
| createdAt | timestamp | auto |

**Notes**: isInternal = true → visible only to PropertyManager and BoardMember roles.

---

## Enumerations

### MaintenanceCategory
- `Plumbing`
- `Electrical`
- `Structural`
- `Landscaping`
- `Other`

### MaintenanceStatus
- `Submitted` — initial state on creation
- `Assigned` — assigned to a staff member
- `InProgress` — work has started
- `Resolved` — work completed, awaiting resident confirmation
- `Closed` — resident confirmed or 7-day window expired

---

## Entity Relationships

```
MaintenanceRequest (1) ---- (N) StatusHistory   [append-only audit trail]
MaintenanceRequest (1) ---- (N) RequestPhoto    [max 3]
MaintenanceRequest (1) ---- (N) RequestNote     [internal + public notes]
User (staff) (1) ---------- (N) MaintenanceRequest [via assignedToUserId]
ResidentProfile (1) ------- (N) MaintenanceRequest
```
