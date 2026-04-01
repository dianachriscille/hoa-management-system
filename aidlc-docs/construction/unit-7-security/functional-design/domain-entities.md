# Domain Entities — Unit 7: Security & Access Control

## Entity: VisitorPass

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| passCode | string | unique, auto-generated (short alphanumeric, used in QR) |
| userId | UUID | FK → User.id (resident) |
| residentProfileId | UUID | FK → ResidentProfile.id |
| visitorName | string | not null, max 200 |
| validDate | date | not null (full day) |
| isRevoked | boolean | default false |
| createdAt | timestamp | auto |

**QR Code content**: `{ passCode, visitorName, validDate, unitNumber }`

---

## Entity: IncidentReport

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| reportNumber | string | unique, auto-generated (INC-2025-001) |
| reportedByUserId | UUID | FK → User.id |
| category | enum | UnauthorizedEntry, Vandalism, NoiseComplaint, SuspiciousActivity, Accident, Other |
| description | text | not null |
| location | string | nullable, max 200 |
| incidentDate | date | not null |
| incidentTime | time | nullable |
| photoKey | string | nullable (S3 key) |
| status | enum | Open, UnderReview, Resolved |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

---

## Enumerations

### IncidentCategory
`UnauthorizedEntry` | `Vandalism` | `NoiseComplaint` | `SuspiciousActivity` | `Accident` | `Other`

### IncidentStatus
`Open` | `UnderReview` | `Resolved`
