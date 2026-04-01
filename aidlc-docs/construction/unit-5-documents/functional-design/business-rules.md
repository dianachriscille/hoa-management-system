# Business Rules — Unit 5: Document Repository

## Upload Rules

| ID | Rule |
|---|---|
| DOC-01 | Only PropertyManager and BoardMember roles can upload documents |
| DOC-02 | On first upload: create Document record + DocumentVersion (versionNumber = 1) |
| DOC-03 | On re-upload (new version): create new DocumentVersion (versionNumber = previous + 1), update Document.currentVersionId |
| DOC-04 | Primary storage: Google Drive via OAuth 2.0 |
| DOC-05 | S3 fallback: if Google Drive OAuth not connected, upload to S3 instead |
| DOC-06 | DocumentVersion records are immutable — never updated or deleted |
| DOC-07 | Document.isActive = false marks document as deleted (soft delete) — versions retained |

## Browse & Download Rules

| ID | Rule |
|---|---|
| DOC-08 | All authenticated users can browse and download documents |
| DOC-09 | Browse returns only active documents (isActive = true) showing current version |
| DOC-10 | Documents filterable by category |
| DOC-11 | Documents searchable by title (case-insensitive ILIKE) |
| DOC-12 | Download returns the Google Drive download URL or S3 pre-signed URL of the current version |
| DOC-13 | Version history (all versions) visible to PropertyManager and BoardMember only |

## Google Drive OAuth Rules

| ID | Rule |
|---|---|
| GDRIVE-01 | Property Manager connects Google Drive via OAuth 2.0 (one-time setup) |
| GDRIVE-02 | OAuth tokens stored in AWS Secrets Manager, refreshed automatically |
| GDRIVE-03 | Uploaded files stored in a dedicated HOA folder in the connected Google Drive |
| GDRIVE-04 | Google Drive file permissions set to "anyone with link can view" for resident access |
| GDRIVE-05 | If OAuth token expires and refresh fails: fall back to S3 upload, alert PM |
