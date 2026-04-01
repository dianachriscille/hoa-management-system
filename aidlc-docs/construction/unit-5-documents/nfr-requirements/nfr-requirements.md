# NFR Requirements — Unit 5: Document Repository

## Inherited NFRs
All Unit 1 base NFRs apply. No new performance or scaling concerns beyond base.

## Document-Specific NFRs

| ID | Requirement |
|---|---|
| PERF-D01 | Document list endpoint < 500ms p95 |
| PERF-D02 | Google Drive upload timeout: 30 seconds (large files) |
| SEC-D01 | Google Drive OAuth tokens stored in AWS Secrets Manager, never in code |
| SEC-D02 | S3 document download via pre-signed GET URLs (15-min expiry) |
| SEC-D03 | Only PM/Board can upload, update, or delete documents |
| RET-D01 | Document metadata and version history retained indefinitely |
| RET-D02 | S3 files retained indefinitely |
| REL-D01 | Google Drive upload failure: automatic S3 fallback, PM notified |
| MON-D01 | CloudWatch alarm on Google Drive API error rate > 5 in 10 min |

## Tech Stack Additions

| Concern | Decision |
|---|---|
| Google Drive SDK | `googleapis` npm package |
| OAuth token storage | AWS Secrets Manager (per-HOA Google Drive token) |
| File upload handling | NestJS `@nestjs/platform-express` + `multer` (in-memory, max 50MB) |
