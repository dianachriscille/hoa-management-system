# Infrastructure Design — Unit 7: Security & Access Control

## Shared Infrastructure (from Unit 1)
All resources shared. No new AWS services needed.

## New Infrastructure for Unit 7

### AWS Secrets Manager
| Secret | Contents |
|---|---|
| `hoa-system/{env}/qr-hmac-secret` | HMAC-SHA256 signing secret for QR payloads |

### Database Migration
```
backend/src/database/migrations/1720915800000-CreateSecurityTables.ts
Creates: visitor_pass, incident_report tables + incident_report_seq sequence
```

### S3 Path Convention
```
hoa-uploads-{env}/incidents/{reportId}/{uuid}.jpg
```

### Terraform Changes
- Add `hoa-system/{env}/qr-hmac-secret` to secrets module
- No new compute or network resources
