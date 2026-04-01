# Business Rules — Unit 3: Maintenance Request Tracking

## Submission Rules

| ID | Rule |
|---|---|
| SUB-01 | Resident must provide: category, description (min 10 chars), location |
| SUB-02 | Up to 3 photos may be attached; each photo uploaded via S3 pre-signed URL |
| SUB-03 | Photo max size: 10MB per file; accepted formats: JPG, PNG |
| SUB-04 | Request number auto-generated: `MNT-{YYYY}-{sequence}` (e.g., MNT-2025-001) |
| SUB-05 | New request status = Submitted |
| SUB-06 | On submission: Property Manager receives push notification and email |
| SUB-07 | Resident receives confirmation push notification on successful submission |

---

## Assignment Rules

| ID | Rule |
|---|---|
| ASN-01 | Only Property Manager can assign requests |
| ASN-02 | Assignee must be an active user with a staff-level role (PropertyManager or designated staff) |
| ASN-03 | On assignment: status changes to Assigned, assignedToUserId and assignedAt set |
| ASN-04 | Assigned staff member receives push notification |
| ASN-05 | Resident receives push notification when request is assigned |
| ASN-06 | A request can be reassigned — previous assignment overwritten, new StatusHistory entry created |

---

## Status Transition Rules

| ID | Rule |
|---|---|
| STAT-01 | Valid transitions: Submitted→Assigned, Assigned→InProgress, InProgress→Resolved, Resolved→Closed, Resolved→Submitted (reopen) |
| STAT-02 | Only Property Manager can transition: Submitted→Assigned, Assigned→InProgress, InProgress→Resolved |
| STAT-03 | Resident can transition: Resolved→Closed (confirm resolution) or Resolved→Submitted (reopen within 7 days) |
| STAT-04 | Auto-close: if resident does not confirm within 7 days of Resolved, status automatically changes to Closed via BullMQ job |
| STAT-05 | On reopen: status returns to Submitted, reopenDeadline cleared, new StatusHistory entry created |
| STAT-06 | Reopen only allowed within 7 days of resolvedAt (reopenDeadline = resolvedAt + 7 days) |
| STAT-07 | All status changes logged in StatusHistory with changedByUserId and optional note |
| STAT-08 | Closed requests cannot be reopened or modified |

---

## Notification Rules

| ID | Rule |
|---|---|
| NOTIF-01 | Resident notified (push + in-app) on: Assigned, InProgress, Resolved, Closed |
| NOTIF-02 | Property Manager notified (push + email) on: new Submitted request |
| NOTIF-03 | Assigned staff notified (push) on: assignment |
| NOTIF-04 | Real-time WebSocket update sent to resident's channel on every status change |
| NOTIF-05 | Resident notified 1 day before auto-close deadline: "Your request will be auto-closed in 24 hours if not confirmed" |

---

## Notes Rules

| ID | Rule |
|---|---|
| NOTE-01 | Any authenticated user can add a note to a request they have access to |
| NOTE-02 | isInternal = true notes visible only to PropertyManager and BoardMember roles |
| NOTE-03 | isInternal = false notes visible to all parties including the resident |
| NOTE-04 | Notes are immutable — cannot be edited or deleted after creation |

---

## Analytics Rules

| ID | Rule |
|---|---|
| ANA-01 | Analytics available to PropertyManager and BoardMember roles only |
| ANA-02 | Metrics: total open, total closed this month, average resolution time (Submitted→Closed in days) |
| ANA-03 | Breakdown by category: count of requests per category |
| ANA-04 | Date range filter: default current month, configurable |
| ANA-05 | Average resolution time excludes requests still open |
