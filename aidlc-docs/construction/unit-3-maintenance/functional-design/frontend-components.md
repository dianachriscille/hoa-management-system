# Frontend Components — Unit 3: Maintenance Request Tracking

## Feature: maintenance (`src/features/maintenance/`)

### Component Hierarchy

```
MaintenanceLayout
├── MaintenanceListPage (Resident)
│   ├── NewRequestButton
│   ├── RequestFilterTabs (All / Open / Resolved / Closed)
│   └── RequestCard (per request)
│       ├── RequestStatusBadge
│       ├── CategoryBadge
│       ├── RequestSummary (number, description preview, location)
│       ├── CreatedAtLabel
│       └── ViewDetailsButton
│
├── NewRequestPage (Resident)
│   └── NewRequestForm
│       ├── CategorySelect
│       ├── LocationInput
│       ├── DescriptionTextarea (min 10 chars)
│       ├── PhotoUploadSection (max 3, S3 pre-signed URL)
│       │   └── PhotoPreview (per uploaded photo)
│       └── SubmitButton
│
├── RequestDetailPage (Resident + PM)
│   ├── RequestHeader (number, status badge, category)
│   ├── RequestInfo (description, location, submitted date)
│   ├── PhotoGallery (uploaded photos)
│   ├── StatusTimeline (StatusHistory entries)
│   ├── NotesSection
│   │   ├── NoteList (public notes visible to resident)
│   │   ├── InternalNoteList (PM/Board only)
│   │   └── AddNoteForm
│   ├── ResidentActions (visible when status = Resolved)
│   │   ├── ConfirmResolutionButton
│   │   └── ReopenButton (visible within 7-day window)
│   └── PMActions (PM only)
│       ├── AssignRequestSection
│       │   ├── AssigneeSelect (staff users)
│       │   └── AssignButton
│       └── UpdateStatusSection
│           ├── StatusSelect (valid next statuses)
│           ├── NoteInput (optional)
│           ├── IsInternalToggle
│           └── UpdateButton
│
└── MaintenanceAnalyticsPage (PM + Board)
    ├── DateRangeFilter
    ├── SummaryCards
    │   ├── TotalOpenCard
    │   ├── TotalClosedCard
    │   └── AvgResolutionTimeCard
    └── CategoryBreakdownChart
```

---

### State Management

| Component | State | Description |
|---|---|---|
| MaintenanceListPage | `{ requests[], filter, isLoading }` | Request list with filter |
| NewRequestForm | `{ formData, photos[], isUploading, isSubmitting, error }` | Multi-field form + S3 upload |
| RequestDetailPage | `{ request, notes[], isLoading }` | Full request detail |
| WebSocket listener | `useMaintenanceSocket()` hook | Invalidates TanStack Query cache on status update |

---

### Real-Time WebSocket Integration

```typescript
// useMaintenanceSocket hook
function useMaintenanceSocket() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    socket.on('maintenance:status-update', (data) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-request', data.requestId] });
    });
    return () => socket.off('maintenance:status-update');
  }, [socket, queryClient]);
}
```

---

### API Integration Points

| Component | Endpoint | Method |
|---|---|---|
| MaintenanceListPage | `/maintenance/requests/me` | GET |
| NewRequestForm | `/files/presigned-url` (per photo) | POST |
| NewRequestForm | `/maintenance/requests` | POST |
| RequestDetailPage | `/maintenance/requests/:id` | GET |
| AssignRequestSection | `/maintenance/requests/:id/assign` | PATCH |
| UpdateStatusSection | `/maintenance/requests/:id/status` | PATCH |
| ConfirmResolutionButton | `/maintenance/requests/:id/confirm` | POST |
| ReopenButton | `/maintenance/requests/:id/reopen` | POST |
| AddNoteForm | `/maintenance/requests/:id/notes` | POST |
| MaintenanceAnalyticsPage | `/maintenance/analytics` | GET |

---

### Photo Upload Flow

```
1. User selects photo (max 3, max 10MB each, JPG/PNG)
2. Client validates file type and size
3. POST /files/presigned-url → { key, url }
4. PUT file directly to S3 using pre-signed URL
5. On S3 success: add key to form state photos[]
6. Show thumbnail preview
7. On form submit: send photos[] (S3 keys) with request body
```

---

### Role-Based Rendering

| Component | Visible To |
|---|---|
| NewRequestButton / NewRequestPage | Resident |
| MaintenanceListPage (own requests) | Resident |
| AssignRequestSection | PropertyManager |
| UpdateStatusSection | PropertyManager |
| InternalNoteList + IsInternalToggle | PropertyManager, BoardMember |
| ConfirmResolutionButton / ReopenButton | Resident (on own Resolved requests) |
| MaintenanceAnalyticsPage | PropertyManager, BoardMember |
| All requests list (PM view) | PropertyManager, BoardMember |
