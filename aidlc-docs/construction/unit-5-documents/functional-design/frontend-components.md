# Frontend Components — Unit 5: Document Repository

## Feature: document (`src/features/document/`)

### Component Hierarchy

```
DocumentLayout
├── DocumentRepositoryPage (All roles)
│   ├── DocumentSearchBar
│   ├── CategoryFilterTabs (All / Policies / Meeting Minutes / Forms / Announcements)
│   ├── DocumentList
│   │   └── DocumentCard (per document)
│   │       ├── DocumentTitle + CategoryBadge
│   │       ├── DescriptionPreview
│   │       ├── FileSizeLabel + ProviderIcon (Google Drive / S3)
│   │       ├── DownloadButton
│   │       └── ManageButton (PM/Board only)
│   └── UploadDocumentButton (PM/Board only)
│
├── UploadDocumentModal (PM/Board only)
│   ├── TitleInput
│   ├── CategorySelect
│   ├── DescriptionInput (optional)
│   ├── FilePickerButton
│   │   └── SelectedFileInfo (name, size)
│   └── UploadButton
│
└── DocumentVersionHistoryModal (PM/Board only)
    └── VersionList
        └── VersionRow (versionNumber, date, size, provider, downloadLink)
```

---

### State Management

| Component | State | Description |
|---|---|---|
| DocumentRepositoryPage | `{ documents[], category, search, isLoading }` | Document list with filters |
| UploadDocumentModal | `{ isOpen, title, category, file, isUploading, error }` | Upload form state |
| DocumentVersionHistoryModal | `{ isOpen, documentId, versions[], isLoading }` | Version history |

---

### API Integration Points

| Component | Endpoint | Method |
|---|---|---|
| DocumentRepositoryPage | `/documents?category=&search=` | GET |
| DownloadButton | `/documents/:id/download` | GET |
| UploadDocumentModal | `/documents` (new) or `/documents/:id/version` (re-upload) | POST |
| ManageButton → delete | `/documents/:id` | DELETE |
| DocumentVersionHistoryModal | `/documents/:id/versions` | GET |

---

### Upload Flow

```
1. PM/Board clicks "Upload Document"
2. UploadDocumentModal opens
3. User fills title, category, description, selects file
4. On submit:
   a. POST /documents with multipart form data
   b. Backend handles Google Drive upload or S3 fallback
   c. On success: modal closes, document list refreshes
5. Show success toast: "Document uploaded successfully"
```

---

### Role-Based Rendering

| Component | Visible To |
|---|---|
| DownloadButton | All authenticated users |
| UploadDocumentButton | PropertyManager, BoardMember |
| ManageButton (delete, re-upload) | PropertyManager, BoardMember |
| DocumentVersionHistoryModal | PropertyManager, BoardMember |
