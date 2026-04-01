# Domain Entities — Unit 5: Document Repository

## Entity: Document

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| title | string | not null, max 200 |
| category | enum | Policies, MeetingMinutes, Forms, Announcements |
| description | text | nullable |
| currentVersionId | UUID | FK → DocumentVersion.id, nullable (set after first version) |
| uploadedByUserId | UUID | FK → User.id, not null |
| isActive | boolean | default true |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

---

## Entity: DocumentVersion

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| documentId | UUID | FK → Document.id, not null |
| versionNumber | integer | not null, auto-incremented per document |
| googleDriveFileId | string | nullable (Google Drive file ID) |
| googleDriveViewUrl | string | nullable (direct view URL) |
| googleDriveDownloadUrl | string | nullable (direct download URL) |
| s3Key | string | nullable (S3 fallback key) |
| storageProvider | enum | GoogleDrive, S3 |
| fileSizeBytes | integer | nullable |
| mimeType | string | nullable |
| uploadedByUserId | UUID | FK → User.id, not null |
| createdAt | timestamp | auto |

**Notes**: Immutable — versions are never updated or deleted.

---

## Enumerations

### DocumentCategory
- `Policies`
- `MeetingMinutes`
- `Forms`
- `Announcements`

### StorageProvider
- `GoogleDrive`
- `S3`

---

## Entity Relationships

```
Document (1) -------- (N) DocumentVersion
Document (1) -------- (1) DocumentVersion [currentVersionId — latest]
User (1) ------------ (N) Document [uploadedByUserId]
User (1) ------------ (N) DocumentVersion [uploadedByUserId]
```
