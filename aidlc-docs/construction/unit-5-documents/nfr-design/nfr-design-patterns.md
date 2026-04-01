# NFR Design Patterns — Unit 5: Document Repository

## 1. Google Drive OAuth + S3 Fallback Pattern
**Addresses**: REL-D01, GDRIVE-05
- GoogleDriveService wraps googleapis client
- On upload: try Google Drive first; catch error → fall back to S3 via FileModule
- PM notified via email on fallback activation

## 2. Immutable Version Pattern
**Addresses**: DOC-06, RET-D01
- DocumentVersion table: no UPDATE or DELETE privileges for app DB user
- New upload always creates new version record
- Document.currentVersionId pointer updated atomically

## 3. OAuth Token Refresh Pattern
**Addresses**: GDRIVE-02, SEC-D01
- Tokens stored in Secrets Manager: `hoa-system/{env}/google-drive-tokens`
- On API call: check token expiry, refresh if needed, update Secrets Manager
- Refresh handled transparently by googleapis OAuth2Client

## 4. Multer In-Memory Upload
**Addresses**: PERF-D02
- Files buffered in memory (max 50MB) before Google Drive/S3 upload
- NestJS `FileInterceptor` with `memoryStorage()`
- Large file warning shown in UI for files > 10MB
