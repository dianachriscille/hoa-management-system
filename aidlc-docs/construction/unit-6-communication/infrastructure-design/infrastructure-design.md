# Infrastructure Design — Unit 6: Communication Platform

## Shared Infrastructure (from Unit 1)
All compute, network, database, Redis, API Gateway, and CI/CD resources shared from Unit 1.

## New Infrastructure for Unit 6

### AWS Secrets Manager — New Secrets
| Secret | Contents |
|---|---|
| `hoa-system/{env}/fcm-server-key` | Firebase Admin SDK service account JSON |
| `hoa-system/{env}/twilio-account-sid` | Twilio Account SID |
| `hoa-system/{env}/twilio-auth-token` | Twilio Auth Token |
| `hoa-system/{env}/twilio-from-number` | Twilio sender phone number |

### Firebase Setup (Manual)
```
1. Create Firebase project
2. Enable Cloud Messaging
3. Generate service account key (JSON)
4. Store in Secrets Manager: hoa-system/{env}/fcm-server-key
```

### Twilio Setup (Manual)
```
1. Create Twilio account
2. Purchase Philippines-capable phone number
3. Store credentials in Secrets Manager
```

### Database Migration
```
backend/src/database/migrations/1720915700000-CreateCommunicationTables.ts
Creates: announcement, announcement_read, poll, poll_option, poll_vote,
         feedback_form, feedback_question, feedback_response,
         event, event_rsvp, device_token tables
```

### BullMQ Queues (new)
- `communication-push` — FCM dispatch
- `communication-sms` — Twilio SMS dispatch
- `poll-auto-close` — delayed poll closing

All use shared ElastiCache Redis — no new infrastructure.
