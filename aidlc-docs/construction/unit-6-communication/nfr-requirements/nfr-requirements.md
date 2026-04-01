# NFR Requirements — Unit 6: Communication Platform

## Inherited NFRs
All Unit 1 base NFRs apply.

## Communication-Specific NFRs

| ID | Requirement |
|---|---|
| PERF-C01 | Announcement list < 500ms p95 |
| PERF-C02 | FCM push dispatch: async, non-blocking — does not delay API response |
| PERF-C03 | Twilio SMS dispatch: async via BullMQ, non-blocking |
| REL-C01 | FCM batch dispatch: invalid tokens removed automatically |
| REL-C02 | Twilio failures logged to CloudWatch, do not block publish |
| REL-C03 | Poll auto-close BullMQ job: 2 retries on failure |
| SEC-C01 | FCM server key stored in AWS Secrets Manager |
| SEC-C02 | Twilio credentials stored in AWS Secrets Manager |
| SEC-C03 | Poll results hidden while Active — enforced at API layer |
| SEC-C04 | Feedback responses visible only to Board/PM |
| RET-C01 | All communication records retained indefinitely |

## Tech Stack Additions

| Concern | Decision |
|---|---|
| FCM | `firebase-admin` npm package (Firebase Admin SDK) |
| Twilio | `twilio` npm package |
| BullMQ queues | `communication-push`, `communication-sms`, `poll-auto-close` |
