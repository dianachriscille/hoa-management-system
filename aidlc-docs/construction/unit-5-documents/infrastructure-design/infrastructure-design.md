# Infrastructure Design — Unit 5: Document Repository

## Shared Infrastructure (from Unit 1)
All compute, network, database, S3, API Gateway, and CI/CD resources shared from Unit 1.

## New Infrastructure for Unit 5

### AWS Secrets Manager — New Secrets
| Secret | Contents |
|---|---|
| `hoa-system/dev/google-drive-tokens` | Google Drive OAuth access + refresh tokens (JSON) |
| `hoa-system/prod/google-drive-tokens` | Google Drive OAuth access + refresh tokens (JSON) |
| `hoa-system/dev/google-drive-client-id` | Google OAuth client ID |
| `hoa-system/dev/google-drive-client-secret` | Google OAuth client secret |
| `hoa-system/prod/google-drive-client-id` | Google OAuth client ID |
| `hoa-system/prod/google-drive-client-secret` | Google OAuth client secret |

### Google Drive Setup (Manual)
```
1. Create Google Cloud project
2. Enable Google Drive API
3. Create OAuth 2.0 credentials (Web application)
4. Set redirect URI: https://api.{domain}/documents/oauth/callback
5. Store client ID + secret in Secrets Manager
6. PM completes OAuth flow via /documents/oauth/connect endpoint
7. Tokens stored in Secrets Manager after callback
```

### Database Migration
```
backend/src/database/migrations/1720915600000-CreateDocumentTables.ts
Creates: document, document_version tables
```

### Terraform Changes
- Add 6 new Secrets Manager secrets
- No new compute or network resources needed
