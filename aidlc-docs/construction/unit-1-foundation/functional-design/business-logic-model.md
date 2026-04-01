# Business Logic Model — Unit 1: Foundation

## Flow 1: Resident Self-Registration

```
1. Resident submits registration form
   - Fields: firstName, lastName, unitNumber, email, password,
             contactNumber, vehiclePlate1?, vehiclePlate2?,
             emergencyContactName?, emergencyContactNumber?,
             consentGiven (boolean)

2. Validate inputs
   - Email format valid
   - Password meets complexity rules (REG-04)
   - Unit number not already registered (REG-02, REG-03)
   - Email not already registered (REG-01)
   - consentGiven must be true (REG-07)

3. Create User record
   - Hash password with bcrypt (cost factor 12)
   - Set role = Resident
   - Set isEmailVerified = false
   - Generate emailVerificationToken (UUID, expires 24h)

4. Create ResidentProfile record
   - Link to User.id
   - Store all profile fields

5. Record ConsentRecord
   - consentType = DataCollection, DataProcessing
   - Capture IP address, userAgent, timestamp, consent text snapshot

6. Log AuditLog entry
   - action = USER_REGISTERED

7. Send verification email via AWS SES
   - Link contains emailVerificationToken

8. Return success response (201)
   - Do NOT issue JWT yet — email must be verified first
```

---

## Flow 2: Email Verification

```
1. Resident clicks verification link (GET /auth/verify-email?token=...)

2. Look up User by emailVerificationToken
   - If not found: return 400 "Invalid or expired verification link"
   - If token expired (> 24h): return 400 "Verification link expired. Please request a new one."

3. Set User.isEmailVerified = true
4. Clear emailVerificationToken

5. Log AuditLog entry
   - action = EMAIL_VERIFIED

6. Return success — redirect to login page
```

---

## Flow 3: Login

```
1. User submits email + password

2. Look up User by email
   - If not found: return 401 "Invalid credentials" (do not reveal whether email exists)

3. Check isActive = true
   - If false: return 403 "Account is deactivated. Contact the property manager."

4. Check isEmailVerified = true
   - If false: return 403 "Please verify your email before logging in."

5. Check account lock (Redis key: lock:{userId})
   - If locked: return 429 "Too many failed attempts. Try again in 15 minutes."

6. Verify password against passwordHash (bcrypt.compare)
   - If mismatch:
     - Increment failed attempt counter in Redis (TTL 15 min)
     - If counter >= 5: set lock key in Redis (TTL 15 min)
     - Log AuditLog: action = LOGIN_FAILED
     - Return 401 "Invalid credentials"

7. Clear failed attempt counter in Redis

8. Issue JWT access token (expires 15 min)
   - Payload: { sub: userId, role, email }

9. Issue refresh token
   - Generate secure random token
   - Hash with bcrypt, store in RefreshToken table (expires 7 days)
   - Return raw token to client (httpOnly cookie or response body)

10. Store session in Redis (key: session:{userId}, TTL 7 days)

11. Log AuditLog: action = USER_LOGIN

12. Return 200 with accessToken + refreshToken
```

---

## Flow 4: Token Refresh

```
1. Client sends refresh token

2. Look up RefreshToken record by hashed token
   - If not found or isRevoked = true: return 401 "Invalid refresh token"
   - If expired: return 401 "Session expired. Please log in again."

3. Issue new access token (15 min)
4. Rotate refresh token (revoke old, issue new 7-day token)

5. Return new accessToken + refreshToken
```

---

## Flow 5: Logout

```
1. Client sends refresh token

2. Find and revoke RefreshToken record (isRevoked = true)
3. Delete session from Redis (key: session:{userId})

4. Log AuditLog: action = USER_LOGOUT

5. Return 200
```

---

## Flow 6: Password Reset

```
1. User submits email for password reset

2. Look up User by email
   - If not found: return 200 (do not reveal whether email exists — security)

3. Generate passwordResetToken (UUID), set passwordResetExpiresAt (1 hour)
4. Save to User record

5. Send password reset email via AWS SES

6. Log AuditLog: action = PASSWORD_RESET_REQUESTED

---

7. User submits new password with reset token

8. Look up User by passwordResetToken
   - If not found or expired: return 400 "Invalid or expired reset link"

9. Hash new password, update User.passwordHash
10. Clear passwordResetToken and passwordResetExpiresAt
11. Revoke all existing RefreshToken records for this user (AUTH-05)
12. Delete all sessions from Redis for this user

13. Log AuditLog: action = PASSWORD_RESET_COMPLETED

14. Return 200
```

---

## Flow 7: Resident Profile Update

```
1. Authenticated Resident submits profile update
   - Allowed fields: contactNumber, vehiclePlate1, vehiclePlate2,
                     emergencyContactName, emergencyContactNumber

2. Validate inputs (field formats, max lengths)

3. If profilePhoto included:
   - Request S3 pre-signed URL from FileModule
   - Return pre-signed URL to client
   - Client uploads directly to S3
   - Client confirms upload with S3 key
   - Update ResidentProfile.profilePhotoKey
   - Delete old photo from S3 if exists

4. Update ResidentProfile fields

5. Log AuditLog: action = PROFILE_UPDATED, entityId = residentProfileId

6. Return updated ResidentProfile
```

---

## Flow 8: Role Management (Property Manager)

```
1. Property Manager submits role change for a user

2. Validate:
   - Target user exists and is active
   - If demoting a PropertyManager: ensure at least one other active PropertyManager exists (RBAC-08)

3. Update User.role

4. Log AuditLog: action = ROLE_CHANGED, metadata = { previousRole, newRole }

5. Send email notification to user about role change

6. Return updated User
```

---

## Flow 9: DPA Data Deletion Request

```
1. Resident submits data deletion request

2. Create DataRequest record
   - requestType = Deletion, status = Pending

3. Notify Property Manager (in-app notification)

4. Property Manager reviews and approves

5. On approval:
   - Set User.isActive = false
   - Anonymize PII fields in ResidentProfile:
     firstName = "[DELETED]", lastName = "[DELETED]",
     contactNumber = "[DELETED]", vehiclePlate1 = null,
     vehiclePlate2 = null, emergencyContactName = null,
     emergencyContactNumber = null, profilePhotoKey = null
   - Delete profile photo from S3
   - Set DataRequest.status = Completed, completedAt = now()

6. Schedule permanent deletion job for 1 year later
   - Job deletes User record and remaining anonymized ResidentProfile

7. Log AuditLog: action = DATA_DELETION_COMPLETED

8. Send confirmation email to resident
```
