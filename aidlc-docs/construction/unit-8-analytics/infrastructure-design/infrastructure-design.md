# Infrastructure Design — Unit 8: Analytics & Reporting

## Shared Infrastructure (from Unit 1)
All resources shared. No new AWS services needed.

## New Infrastructure for Unit 8

### Database Migration
```
backend/src/database/migrations/1720915900000-CreateAnalyticsTables.ts
Creates: monthly_budget table
```

### Terraform Changes
None — no new AWS resources required.
All analytics queries run against existing RDS PostgreSQL instance.
PDF/CSV exports returned directly in HTTP response — no S3 storage needed.
