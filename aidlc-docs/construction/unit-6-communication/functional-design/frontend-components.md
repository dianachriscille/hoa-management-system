# Frontend Components — Unit 6: Communication Platform

## Feature: communication (`src/features/communication/`)

### Component Hierarchy

```
CommunicationLayout
├── AnnouncementsPage (All roles)
│   ├── CreateAnnouncementButton (Board/PM only)
│   └── AnnouncementList
│       └── AnnouncementCard
│           ├── Title + PublishedAt
│           ├── BodyPreview
│           └── ReadMoreButton → AnnouncementDetailPage
│
├── AnnouncementDetailPage
│   └── FullBody (marks as read on open)
│
├── CreateAnnouncementModal (Board/PM only)
│   ├── TitleInput
│   ├── BodyTextarea
│   ├── SendPushToggle
│   ├── SendSmsToggle
│   └── PublishButton / SaveDraftButton
│
├── PollsPage (All roles)
│   ├── CreatePollButton (Board/PM only)
│   ├── ActivePollsList
│   │   └── PollCard
│   │       ├── Question + ClosingDate
│   │       ├── VoteSection (if Active + not voted)
│   │       │   ├── OptionRadioList
│   │       │   └── SubmitVoteButton
│   │       └── ResultsSection (if Closed or already voted)
│   │           └── OptionResultBar (option text + vote count + %)
│   └── ClosedPollsList
│
├── CreatePollModal (Board/PM only)
│   ├── QuestionInput
│   ├── OptionsBuilder (add/remove options, min 2)
│   ├── ClosingDatePicker
│   └── CreateButton
│
├── FeedbackFormsPage (All roles)
│   ├── CreateFormButton (Board/PM only)
│   └── FormList
│       └── FormCard → FeedbackFormPage
│
├── FeedbackFormPage (Resident)
│   ├── FormTitle + Description
│   ├── QuestionList
│   │   └── QuestionInput (text input per question)
│   └── SubmitButton
│
├── EventsPage (All roles)
│   ├── CreateEventButton (Board/PM only)
│   └── EventList
│       └── EventCard
│           ├── Title + Date + Location
│           ├── AttendingCount
│           └── RsvpButtons (Attending / Not Attending)
│
└── EngagementMetricsPage (Board/PM only)
    ├── DateRangeFilter
    ├── PollParticipationCard
    ├── EventRsvpRateCard
    └── AnnouncementOpenRateCard
```

---

### API Integration Points

| Component | Endpoint | Method |
|---|---|---|
| AnnouncementsPage | `/communication/announcements` | GET |
| AnnouncementDetailPage | `/communication/announcements/:id/read` | POST |
| CreateAnnouncementModal | `/communication/announcements` | POST |
| PollsPage | `/communication/polls` | GET |
| SubmitVoteButton | `/communication/polls/:id/vote` | POST |
| CreatePollModal | `/communication/polls` | POST |
| FeedbackFormsPage | `/communication/forms` | GET |
| FeedbackFormPage | `/communication/forms/:id/respond` | POST |
| EventsPage | `/communication/events` | GET |
| RsvpButtons | `/communication/events/:id/rsvp` | POST |
| CreateEventButton | `/communication/events` | POST |
| EngagementMetricsPage | `/communication/metrics` | GET |

---

### Role-Based Rendering

| Component | Visible To |
|---|---|
| CreateAnnouncementModal | BoardMember, PropertyManager |
| CreatePollModal | BoardMember, PropertyManager |
| CreateFormButton | BoardMember, PropertyManager |
| CreateEventButton | BoardMember, PropertyManager |
| EngagementMetricsPage | BoardMember, PropertyManager |
| Poll results | All (only after poll closes) |
| Full RSVP list | BoardMember, PropertyManager |
