# Business Rules — Unit 7: Security & Access Control

## Visitor Pass Rules
| ID | Rule |
|---|---|
| PASS-01 | Resident can create unlimited active passes |
| PASS-02 | Valid date must be today or a future date |
| PASS-03 | passCode auto-generated: 8-character alphanumeric (URL-safe) |
| PASS-04 | QR code encodes: `{ passCode, visitorName, validDate, unitNumber }` as JSON |
| PASS-05 | Pass is valid only on validDate (full day 00:00–23:59) |
| PASS-06 | Expired passes (validDate < today) are invalid on verification |
| PASS-07 | Resident can revoke a pass (isRevoked = true) |
| PASS-08 | Gate guard can look up passes by passCode or visitor name |

## Incident Report Rules
| ID | Rule |
|---|---|
| INC-01 | Any authenticated user (Resident or GateGuard) can submit incident reports |
| INC-02 | Report number: `INC-{YYYY}-{sequence}` |
| INC-03 | Photo optional — uploaded via S3 pre-signed URL (max 10MB) |
| INC-04 | On submission: Board Members and Property Manager notified via push |
| INC-05 | Status management (Open → UnderReview → Resolved) by PM/Board only |
| INC-06 | All reports visible to Board Members and Property Manager |
| INC-07 | Residents can only view their own submitted reports |

## Gate Guard Interface Rules
| ID | Rule |
|---|---|
| GATE-01 | Gate Guard role view is touch-optimized (large targets, high contrast) |
| GATE-02 | Today's visitor list shows all passes with validDate = today and isRevoked = false |
| GATE-03 | QR scan decodes JSON payload, looks up pass by passCode |
| GATE-04 | Verification result: VALID (green) or INVALID (red) with reason |
| GATE-05 | Resident lookup by unit number returns: name, profile photo |
