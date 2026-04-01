# Domain Entities — Unit 1: Foundation

## Entity: User

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| email | string | unique, not null, max 255 |
| passwordHash | string | not null (bcrypt) |
| role | enum | Resident, BoardMember, PropertyManager, GateGuard |
| isEmailVerified | boolean | default false |
| emailVerificationToken | string | nullable, expires in 24h |
| passwordResetToken | string | nullable, expires in 1h |
| passwordResetExpiresAt | timestamp | nullable |
| isActive | boolean | default true |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |
| deletedAt | timestamp | nullable (soft delete marker) |

**Relationships**:
- One User → One ResidentProfile (for Resident role)
- One User → Many ConsentRecord
- One User → Many AuditLog

---

## Entity: ResidentProfile

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| userId | UUID | FK → User.id, unique |
| unitNumber | string | unique among active profiles, not null, max 20 |
| firstName | string | not null, max 100 |
| lastName | string | not null, max 100 |
| contactNumber | string | not null, max 20 |
| vehiclePlate1 | string | nullable, max 20 |
| vehiclePlate2 | string | nullable, max 20 |
| emergencyContactName | string | nullable, max 200 |
| emergencyContactNumber | string | nullable, max 20 |
| profilePhotoKey | string | nullable (S3 object key) |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

**Relationships**:
- One ResidentProfile → One User
- One ResidentProfile → Many ConsentRecord (via userId)

---

## Entity: ConsentRecord

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| userId | UUID | FK → User.id, not null |
| consentType | enum | DataCollection, DataProcessing, Marketing |
| consentGiven | boolean | not null |
| ipAddress | string | not null (for DPA audit trail) |
| userAgent | string | nullable |
| consentText | text | not null (snapshot of consent wording at time of consent) |
| givenAt | timestamp | not null |

**Notes**: Immutable — consent records are never updated, only new records added.

---

## Entity: DataRequest

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| userId | UUID | FK → User.id, not null |
| requestType | enum | Access, Correction, Deletion |
| status | enum | Pending, InProgress, Completed |
| requestedAt | timestamp | not null |
| completedAt | timestamp | nullable |
| handledBy | UUID | FK → User.id (PropertyManager), nullable |
| notes | text | nullable |

---

## Entity: AuditLog

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| userId | UUID | FK → User.id, nullable (null for system actions) |
| action | string | not null (e.g., USER_LOGIN, PROFILE_UPDATED, ROLE_CHANGED) |
| entityType | string | not null (e.g., User, ResidentProfile) |
| entityId | UUID | nullable |
| ipAddress | string | nullable |
| metadata | jsonb | nullable (additional context) |
| performedAt | timestamp | not null |

**Notes**: Append-only. Never updated or deleted. Required for DPA 2012 compliance.

---

## Entity: RefreshToken

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| userId | UUID | FK → User.id, not null |
| tokenHash | string | not null (hashed refresh token) |
| expiresAt | timestamp | not null (7 days from issuance) |
| isRevoked | boolean | default false |
| createdAt | timestamp | auto |

---

## Entity Relationships Diagram

```
User (1) -------- (1) ResidentProfile
User (1) -------- (N) ConsentRecord
User (1) -------- (N) DataRequest
User (1) -------- (N) AuditLog
User (1) -------- (N) RefreshToken
```

---

## Enumerations

### Role
- `Resident`
- `BoardMember`
- `PropertyManager`
- `GateGuard`

### ConsentType
- `DataCollection` — consent to collect personal data
- `DataProcessing` — consent to process data for HOA operations
- `Marketing` — consent to receive non-essential communications

### RequestType (DataRequest)
- `Access` — resident requests copy of their data
- `Correction` — resident requests correction of inaccurate data
- `Deletion` — resident requests deletion/anonymization of their data

### DataRequestStatus
- `Pending`
- `InProgress`
- `Completed`
