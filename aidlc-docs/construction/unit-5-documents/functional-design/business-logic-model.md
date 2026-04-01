# Business Logic Model — Unit 5: Document Repository

## Flow 1: Upload Document (Google Drive)

```
1. PM/Board submits: title, category, description?, file (binary)

2. Check Google Drive OAuth token:
   - If valid: proceed to step 3
   - If expired: attempt token refresh
   - If refresh fails: fall back to S3 upload (Flow 1b)

3. Upload file to Google Drive:
   POST https://www.googleapis.com/upload/drive/v3/files
   - Store in HOA folder
   - Set permissions: anyone with link can view

4. Receive: { fileId, webViewLink, webContentLink }

5. Create Document record (if new) or fetch existing (if re-upload)

6. Create DocumentVersion:
   - versionNumber = (previous max + 1) or 1
   - storageProvider = GoogleDrive
   - googleDriveFileId, googleDriveViewUrl, googleDriveDownloadUrl

7. Update Document.currentVersionId

8. Log AuditLog: action = DOCUMENT_UPLOADED

9. Return document with current version
```

## Flow 1b: Upload Document (S3 Fallback)

```
1. Generate S3 pre-signed PUT URL (FileModule)
2. Client uploads directly to S3
3. Client confirms upload with S3 key
4. Create DocumentVersion with storageProvider = S3, s3Key
5. Update Document.currentVersionId
```

---

## Flow 2: Browse Documents

```
1. User requests document list with optional: category filter, search query

2. Query Document where isActive = true
   - If category: AND category = :category
   - If search: AND title ILIKE '%:query%'
   - Join with current DocumentVersion

3. Return list with: id, title, category, description, currentVersion (provider, mimeType, size), createdAt
```

---

## Flow 3: Download Document

```
1. User requests download for documentId

2. Load Document + currentVersion

3. If storageProvider = GoogleDrive:
   - Return googleDriveDownloadUrl (direct link, no expiry)

4. If storageProvider = S3:
   - Generate pre-signed GET URL (15-min expiry)
   - Return pre-signed URL

5. Frontend opens URL in new tab
```

---

## Flow 4: View Version History (PM/Board)

```
1. PM/Board requests version history for documentId

2. Load all DocumentVersion records for documentId, ordered by versionNumber DESC

3. Return list with: versionNumber, storageProvider, fileSizeBytes, mimeType, uploadedBy, createdAt
```

---

## Flow 5: Delete Document (Soft Delete)

```
1. PM/Board requests deletion of documentId

2. Set Document.isActive = false

3. Document no longer appears in browse results

4. All DocumentVersion records retained (immutable)

5. Log AuditLog: action = DOCUMENT_DELETED
```
