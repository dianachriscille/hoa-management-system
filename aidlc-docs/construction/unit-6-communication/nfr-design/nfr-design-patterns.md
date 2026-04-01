# NFR Design Patterns — Unit 6: Communication Platform

## 1. Async Push + SMS Dispatch Pattern
**Addresses**: PERF-C02, PERF-C03, REL-C01, REL-C02
- Announcement publish returns 201 immediately
- Push and SMS dispatch enqueued as BullMQ jobs (`communication-push`, `communication-sms`)
- FCM worker: batch sends to all device tokens, removes invalid tokens on failure
- Twilio worker: sends SMS per resident, logs failures, continues on error

## 2. Poll Results Hiding Pattern
**Addresses**: SEC-C03
- GET /polls/:id returns `options` with `voteCount: null` while status = Active
- After poll closes: `voteCount` populated in response
- Enforced at service layer — never expose counts for Active polls

## 3. Idempotent Read Tracking Pattern
**Addresses**: ANN-06, ANN-07
- POST /announcements/:id/read uses INSERT ... ON CONFLICT DO NOTHING
- Safe to call multiple times — no duplicate records

## 4. Poll Auto-Close Delayed Job
**Addresses**: POLL-05, REL-C03
- On poll creation: enqueue BullMQ delayed job with delay = closingDate end-of-day - now()
- Job: set Poll.status = Closed, notify residents
- Idempotent: check status before closing

## 5. Device Token Management Pattern
**Addresses**: REL-C01, NOTIF-03
- Residents register FCM token via POST /notifications/device-token
- On FCM send failure (invalid token): delete DeviceToken record
- Upsert on registration: update token if userId + platform already exists
