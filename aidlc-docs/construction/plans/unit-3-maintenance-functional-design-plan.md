# Functional Design Plan — Unit 3: Maintenance Request Tracking

## Unit Scope
- Maintenance request submission with S3 photo upload (pre-signed URLs)
- Request assignment to staff by Property Manager
- Status lifecycle: Submitted → Assigned → In Progress → Resolved → Closed
- Real-time status updates via WebSocket
- Push notifications on status changes
- Resident resolution confirmation
- Maintenance analytics (open/closed counts, avg resolution time)

## Stories Covered
- 3.1 Submit Maintenance Request
- 3.2 Assign Maintenance Request
- 3.3 Track Maintenance Request Status
- 3.4 Update Request Status

## Dependencies
- Unit 1 (auth, resident profiles, file/S3, notification, WebSocket)

---

## Part 1: Clarifying Questions

### Question 1
What categories should maintenance requests be classified under?

A) Basic — Plumbing, Electrical, Structural, Landscaping, Other
B) Detailed — Plumbing, Electrical, Structural, Landscaping, Pest Control, Elevator, Security, Cleaning, Other
C) Free-text only — no predefined categories
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2
Who can be assigned to a maintenance request?

A) Only internal staff (HOA employees with a staff account in the system)
B) Internal staff or external vendors (vendors tracked by name/company only, no system account)
C) Free-text assignee name only (no system account required)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3
Can a resident reopen a request after it has been marked Resolved?

A) Yes — resident can reopen within 7 days of resolution
B) Yes — resident can reopen at any time before it is Closed
C) No — once Resolved, only the Property Manager can reopen
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 4
How many photos can a resident attach to a maintenance request?

A) 1 photo maximum
B) Up to 3 photos
C) Up to 5 photos
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 5
Should the Property Manager be able to add internal notes to a request (not visible to the resident)?

A) Yes — internal notes visible only to Property Manager and Board Members
B) No — all notes are visible to the resident
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Part 2: Execution Checklist
*(Executed after plan approval)*

- [x] Step 1: Generate domain-entities.md — MaintenanceRequest, StatusHistory, RequestPhoto entities
- [x] Step 2: Generate business-rules.md — submission, assignment, status, notification, analytics rules
- [x] Step 3: Generate business-logic-model.md — submission, assignment, status update, WebSocket, analytics flows
- [x] Step 4: Generate frontend-components.md — maintenance UI component hierarchy, state, real-time updates
