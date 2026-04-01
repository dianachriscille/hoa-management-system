# Functional Design Plan — Unit 7: Security & Access Control

## Unit Scope
- Visitor pass creation with QR code generation
- Visitor pass verification (QR scan + manual lookup) at gate
- Gate Guard role view (touch-optimized, role-based routing)
- Live resident identity verification for gate guard
- Incident report submission with S3 photo upload
- Incident report dashboard (Board Member / Property Manager)

## Stories Covered
- 7.1 Issue Digital Visitor Pass
- 7.2 Verify Visitor Pass at Gate
- 7.3 Verify Resident Identity
- 7.4 Submit Incident Report

## Dependencies
- Unit 1 (auth, resident profiles, file/S3, notification)
- Unit 6 complete

---

## Part 1: Clarifying Questions

### Question 1
What information should the QR code visitor pass contain?

A) Minimal — visitor name, valid date, resident unit number
B) Detailed — visitor name, valid date/time window, resident unit number, resident name, pass ID
C) Just a unique pass ID (all details fetched from DB on scan)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2
Should visitor passes have a time window (e.g., valid 9AM–6PM) or be valid for the entire day?

A) Full day — valid from 00:00 to 23:59 on the specified date
B) Time window — resident specifies start and end time
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3
How many active visitor passes can a resident have at one time?

A) Unlimited — resident can create as many passes as needed
B) Maximum 5 active passes at a time
C) Maximum 10 active passes at a time
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 4
Should incident reports be categorized?

A) Yes — categories: Unauthorized Entry, Vandalism, Noise Complaint, Suspicious Activity, Accident, Other
B) No — free-text description only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 5
Should the gate guard interface show a list of today's expected visitors (all passes valid for today)?

A) Yes — show today's visitor list for quick reference
B) No — gate guard only verifies on demand (scan or search)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Part 2: Execution Checklist
*(Executed after plan approval)*

- [ ] Step 1: Generate domain-entities.md
- [ ] Step 2: Generate business-rules.md
- [ ] Step 3: Generate business-logic-model.md
- [ ] Step 4: Generate frontend-components.md
