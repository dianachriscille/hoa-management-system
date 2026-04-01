# Business Logic Model — Unit 3: Maintenance Request Tracking

## Flow 1: Submit Maintenance Request

```
1. Resident submits: category, description, location, photos[] (S3 keys)

2. Validate:
   - category is valid enum value
   - description >= 10 chars
   - location not empty
   - photos.length <= 3

3. Generate request number:
   SELECT nextval('maintenance_request_seq') → MNT-{YYYY}-{seq}

4. Create MaintenanceRequest (status = Submitted)

5. Create RequestPhoto records for each S3 key

6. Create StatusHistory entry:
   { fromStatus: null, toStatus: Submitted, changedByUserId: resident }

7. Log AuditLog: action = MAINTENANCE_REQUEST_SUBMITTED

8. Notify Property Manager:
   - Push: "New maintenance request #{requestNumber} submitted by Unit {unitNumber}"
   - Email: same content

9. Notify Resident:
   - Push: "Your maintenance request #{requestNumber} has been submitted"

10. Return created request
```

---

## Flow 2: Assign Maintenance Request

```
1. Property Manager submits: requestId, assigneeUserId, note? (optional)

2. Validate:
   - Request exists and status is Submitted or Assigned (reassignment allowed)
   - Assignee is an active user in the system

3. Update MaintenanceRequest:
   - status = Assigned
   - assignedToUserId = assigneeUserId
   - assignedAt = now()

4. Create StatusHistory entry:
   { fromStatus: previous, toStatus: Assigned, changedByUserId: PM, note }

5. Notify assigned staff:
   - Push: "You have been assigned maintenance request #{requestNumber}"

6. Notify resident:
   - Push: "Your request #{requestNumber} has been assigned to our team"

7. Broadcast WebSocket event to resident channel:
   { requestId, status: 'Assigned' }
```

---

## Flow 3: Update Request Status (PM)

```
1. Property Manager submits: requestId, newStatus, note? (optional, isInternal?)

2. Validate status transition (STAT-01, STAT-02):
   - Assigned → InProgress ✓
   - InProgress → Resolved ✓
   - Others → reject with 400

3. Update MaintenanceRequest status

4. If newStatus = Resolved:
   - Set resolvedAt = now()
   - Set reopenDeadline = now() + 7 days
   - Schedule BullMQ delayed job (7 days): auto-close if still Resolved
   - Schedule BullMQ delayed job (6 days): send 24h warning to resident

5. Create StatusHistory entry

6. If note provided: create RequestNote (with isInternal flag)

7. Notify resident via push + WebSocket

8. Log AuditLog: action = MAINTENANCE_STATUS_UPDATED
```

---

## Flow 4: Resident Confirms Resolution (Close)

```
1. Resident clicks "Confirm Resolution" on Resolved request

2. Validate:
   - Request status = Resolved
   - Request belongs to resident

3. Update MaintenanceRequest:
   - status = Closed
   - residentConfirmedAt = now()

4. Create StatusHistory entry:
   { fromStatus: Resolved, toStatus: Closed, changedByUserId: resident }

5. Cancel pending auto-close BullMQ job (if still queued)

6. Notify Property Manager: "Request #{requestNumber} confirmed closed by resident"

7. Log AuditLog: action = MAINTENANCE_REQUEST_CLOSED
```

---

## Flow 5: Resident Reopens Request

```
1. Resident clicks "Reopen" on Resolved request

2. Validate:
   - Request status = Resolved
   - now() <= reopenDeadline (within 7 days)

3. Update MaintenanceRequest:
   - status = Submitted
   - resolvedAt = null
   - reopenDeadline = null
   - assignedToUserId = null

4. Create StatusHistory entry:
   { fromStatus: Resolved, toStatus: Submitted, changedByUserId: resident, note: "Reopened by resident" }

5. Cancel pending auto-close BullMQ job

6. Notify Property Manager: "Request #{requestNumber} has been reopened by resident"

7. Log AuditLog: action = MAINTENANCE_REQUEST_REOPENED
```

---

## Flow 6: Auto-Close Job (BullMQ Delayed)

```
1. BullMQ delayed job fires 7 days after Resolved

2. Load request by ID

3. If status is still Resolved:
   - Update status = Closed
   - closedAt = now()
   - Create StatusHistory: { toStatus: Closed, changedByUserId: 'system', note: 'Auto-closed after 7 days' }
   - Notify resident: "Your request #{requestNumber} has been automatically closed"

4. If status is not Resolved (already Closed or Reopened): no-op
```

---

## Flow 7: Real-Time WebSocket Updates

```
On every status change:
  1. BroadcastService.toUser(userId, 'maintenance:status-update', {
       requestId, requestNumber, newStatus, updatedAt
     })

Gate Guard / Resident frontend:
  socket.on('maintenance:status-update', (data) => {
    // Update request status in TanStack Query cache
    queryClient.invalidateQueries(['maintenance-requests'])
  })
```

---

## Flow 8: Maintenance Analytics

```
1. PM/Board requests analytics with optional date range

2. Query MaintenanceRequest:
   - Total open: status IN (Submitted, Assigned, InProgress)
   - Total closed this period: status = Closed AND closedAt BETWEEN start AND end
   - By category: GROUP BY category, COUNT(*)

3. Compute avg resolution time:
   SELECT AVG(EXTRACT(EPOCH FROM (closed_at - created_at))/86400)
   FROM maintenance_request
   WHERE status = 'Closed' AND closed_at BETWEEN start AND end

4. Return aggregated metrics
```
