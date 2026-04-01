# NFR Requirements — Unit 3: Maintenance Request Tracking

## Inherited NFRs from Unit 1
All Unit 1 NFRs apply: < 500ms p95 for standard endpoints, 50 concurrent sessions, RDS, Redis, ECS auto-scaling, CloudWatch, TLS 1.2+, encryption at rest, DPA 2012.

---

## Maintenance-Specific Performance

| ID | Requirement | Target |
|---|---|---|
| PERF-M01 | Maintenance request list endpoint | < 500ms (p95) |
| PERF-M02 | Request detail endpoint | < 500ms (p95) |
| PERF-M03 | WebSocket status update end-to-end latency | < 3 seconds (PM saves → resident browser updates) |
| PERF-M04 | S3 pre-signed URL generation | < 200ms (p95) |
| PERF-M05 | Analytics aggregation endpoint | < 1500ms (p95) — involves GROUP BY queries |

---

## Real-Time Requirements

| ID | Requirement |
|---|---|
| RT-01 | WebSocket connection established on authenticated user login |
| RT-02 | Status updates broadcast to resident's personal channel: `user:{userId}` |
| RT-03 | Auto-reconnect enabled with exponential backoff (socket.io default: 1s, 2s, 4s, max 30s) |
| RT-04 | On reconnect: client re-fetches latest request state via REST API to catch any missed updates |
| RT-05 | WebSocket server uses Redis adapter (socket.io-redis) to support multi-instance ECS broadcasting |

---

## Reliability

| ID | Requirement |
|---|---|
| REL-M01 | If WebSocket delivery fails: push notification sent as fallback (NOTIF-04) |
| REL-M02 | Auto-close BullMQ job: 2 retries on failure; if all fail, log error and alert PM via email |
| REL-M03 | S3 photo upload failure: return error to client, do not create request — atomic operation |
| REL-M04 | StatusHistory writes are transactional with MaintenanceRequest status updates |

---

## Data Retention

| ID | Requirement |
|---|---|
| RET-M01 | Maintenance requests retained indefinitely |
| RET-M02 | Request photos (S3 objects) retained indefinitely |
| RET-M03 | StatusHistory retained indefinitely (audit trail) |
| RET-M04 | On resident account deletion: request records retained, resident PII fields anonymized in linked ResidentProfile only |

---

## Security

| ID | Requirement |
|---|---|
| SEC-M01 | Residents can only view/modify their own requests — cross-resident access rejected with 403 |
| SEC-M02 | Internal notes (isInternal=true) filtered out of API responses for Resident role |
| SEC-M03 | S3 photo URLs returned as pre-signed GET URLs (15-min expiry) — never public |
| SEC-M04 | WebSocket connections authenticated via JWT on handshake |

---

## Monitoring

| ID | Alarm | Threshold | Action |
|---|---|---|---|
| MON-M01 | WebSocket connection errors | > 10 in 5 min | CloudWatch alarm + email |
| MON-M02 | Auto-close job failures | Any failure | CloudWatch alarm + email |
| MON-M03 | S3 upload error rate | > 5 in 10 min | CloudWatch alarm |
