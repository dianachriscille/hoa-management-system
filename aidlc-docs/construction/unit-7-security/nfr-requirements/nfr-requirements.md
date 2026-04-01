# NFR Requirements — Unit 7: Security & Access Control

## Inherited NFRs
All Unit 1 base NFRs apply.

## Security-Specific NFRs
| ID | Requirement |
|---|---|
| PERF-S01 | Pass verification endpoint < 300ms p95 (gate guard needs instant response) |
| PERF-S02 | Today's visitor list < 500ms p95 |
| SEC-S01 | QR code payload signed with HMAC-SHA256 to prevent forgery |
| SEC-S02 | passCode is cryptographically random (not sequential) |
| SEC-S03 | Gate guard can only access gate guard endpoints — no billing/maintenance access |
| REL-S01 | Pass verification works offline-capable: QR payload contains enough data for basic validation |
| RET-S01 | Visitor passes retained for 1 year then deleted |
| RET-S02 | Incident reports retained indefinitely |
| MON-S01 | CloudWatch alarm on high invalid pass scan rate (> 10 in 5 min) |

## Tech Stack Additions
| Concern | Decision |
|---|---|
| QR code generation | `qrcode` npm package (server-side PNG generation) |
| Pass code generation | `nanoid` (URL-safe, cryptographically random) |
| QR scanning (frontend) | `html5-qrcode` library (browser camera access) |
