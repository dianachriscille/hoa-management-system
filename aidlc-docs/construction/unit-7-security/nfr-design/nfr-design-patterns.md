# NFR Design Patterns — Unit 7: Security & Access Control

## 1. HMAC-Signed QR Payload
**Addresses**: SEC-S01
- QR payload: `{ passCode, visitorName, validDate, unitNumber, sig }`
- sig = HMAC-SHA256(JSON.stringify({ passCode, visitorName, validDate, unitNumber }), QR_SECRET)
- On verification: recompute sig, reject if mismatch
- QR_SECRET stored in AWS Secrets Manager

## 2. Cryptographically Random Pass Code
**Addresses**: SEC-S02
- `nanoid(8)` generates URL-safe 8-char code (57^8 = ~1.1 trillion combinations)
- Unique constraint on passCode column prevents collisions

## 3. Gate Guard Role Isolation
**Addresses**: SEC-S03
- GateGuard role only has access to `/security/*` endpoints
- RolesGuard enforces this at API layer
- Gate guard frontend routes isolated under `/gate-guard/*`

## 4. Fast Verification Pattern
**Addresses**: PERF-S01
- Pass lookup by passCode uses indexed column
- Validation logic is pure in-memory (no additional DB calls after pass fetch)
- Response < 300ms p95 achievable with single indexed query
