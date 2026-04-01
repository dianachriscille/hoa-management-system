# Business Rules — Unit 1: Foundation

## Registration Rules

| ID | Rule |
|---|---|
| REG-01 | Email address must be unique across all User records |
| REG-02 | Unit number must be unique among all active ResidentProfile records |
| REG-03 | If a unit number is already registered to an active account, registration is rejected with: "This unit number is already registered. Please contact the property manager." |
| REG-04 | Password must be minimum 8 characters, contain at least one uppercase letter, one lowercase letter, and one number |
| REG-05 | Email verification token expires after 24 hours; unverified accounts cannot log in |
| REG-06 | Unverified accounts older than 7 days are eligible for cleanup by a scheduled job |
| REG-07 | Explicit consent must be recorded for all data fields at registration before account creation proceeds |
| REG-08 | Consent record must capture: consent text snapshot, IP address, timestamp |

---

## Authentication Rules

| ID | Rule |
|---|---|
| AUTH-01 | Access token expires after 15 minutes |
| AUTH-02 | Refresh token expires after 7 days |
| AUTH-03 | Refresh tokens are stored as bcrypt hashes in the RefreshToken table |
| AUTH-04 | On logout, the refresh token is revoked (isRevoked = true) |
| AUTH-05 | On password reset, all existing refresh tokens for the user are revoked |
| AUTH-06 | Password reset token expires after 1 hour |
| AUTH-07 | Maximum 5 failed login attempts before account is temporarily locked for 15 minutes |
| AUTH-08 | All authentication events (login, logout, failed attempt, password reset) are logged in AuditLog |
| AUTH-09 | Active sessions are tracked in Redis with userId as key; session invalidated on logout |

---

## RBAC Rules

| ID | Rule |
|---|---|
| RBAC-01 | Every API endpoint is protected by role-based middleware |
| RBAC-02 | Resident role: access to own profile, billing, maintenance, amenity, documents, communication, security (visitor passes) |
| RBAC-03 | BoardMember role: all Resident access + announcements management, polls, events, analytics dashboards |
| RBAC-04 | PropertyManager role: all BoardMember access + resident directory, role management, billing management, maintenance assignment, amenity management, document management, incident reports |
| RBAC-05 | GateGuard role: gate guard interface only — visitor pass verification, resident lookup, incident report submission |
| RBAC-06 | A user may only hold one role at a time |
| RBAC-07 | Role changes are logged in AuditLog with previous and new role |
| RBAC-08 | The system must always have at least one active PropertyManager account; demotion of the last PropertyManager is rejected |

---

## Profile Management Rules

| ID | Rule |
|---|---|
| PROF-01 | Residents may update: contact number, vehicle plates, emergency contact, profile photo |
| PROF-02 | Unit number changes are not permitted by the resident; must be requested through the Property Manager |
| PROF-03 | Email changes require re-verification via a new verification email |
| PROF-04 | Profile photo must be uploaded via S3 pre-signed URL; max file size 5MB; accepted formats: JPG, PNG |
| PROF-05 | Profile photo S3 key is stored in ResidentProfile.profilePhotoKey; old photo is deleted from S3 on replacement |
| PROF-06 | All profile updates are logged in AuditLog |

---

## Philippines DPA 2012 Rules

| ID | Rule |
|---|---|
| DPA-01 | Explicit consent must be obtained before collecting any personal data |
| DPA-02 | Consent records are immutable — never updated or deleted |
| DPA-03 | Residents may submit a Data Access request to receive a copy of all their personal data |
| DPA-04 | Residents may submit a Data Correction request; Property Manager must action within 15 business days |
| DPA-05 | Residents may submit a Data Deletion request; PII is anonymized within 72 hours of request approval |
| DPA-06 | Billing and audit records are retained for 1 year after account deletion before permanent PII deletion |
| DPA-07 | After 1 year, PII fields are replaced with anonymized placeholders (e.g., "[DELETED]") |
| DPA-08 | AuditLog records are retained indefinitely (non-PII) for compliance purposes |
| DPA-09 | All data access and modification events on personal data are logged in AuditLog |
| DPA-10 | A designated Data Privacy Officer (DPO) role maps to the PropertyManager role in the system |

---

## Data Retention Rules

| ID | Rule |
|---|---|
| RET-01 | Active resident data: retained indefinitely while account is active |
| RET-02 | Deactivated/deleted accounts: PII retained for 1 year, then anonymized |
| RET-03 | ConsentRecord: retained indefinitely (required for DPA compliance) |
| RET-04 | AuditLog: retained indefinitely |
| RET-05 | RefreshToken: expired tokens purged after 30 days by scheduled cleanup job |
| RET-06 | EmailVerificationToken: purged after 7 days if unused |

---

## Infrastructure Rules (Terraform)

| ID | Rule |
|---|---|
| INFRA-01 | Two environments: dev and production, each as a separate Terraform workspace |
| INFRA-02 | All secrets (DB passwords, JWT secret, GCash keys) stored in AWS Secrets Manager, never in code |
| INFRA-03 | RDS instance in private subnet; no public access |
| INFRA-04 | ElastiCache Redis in private subnet; no public access |
| INFRA-05 | S3 buckets have public access blocked; access via pre-signed URLs only |
| INFRA-06 | ECS tasks use IAM roles with least-privilege permissions |
| INFRA-07 | All data in transit encrypted via TLS 1.2+ (enforced at API Gateway and RDS) |
| INFRA-08 | All data at rest encrypted (RDS encryption enabled, S3 SSE-S3) |
