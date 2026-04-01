# Domain Entities — Unit 6: Communication Platform

## Entity: Announcement

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| title | string | not null, max 200 |
| body | text | not null |
| status | enum | Draft, Published |
| sendPush | boolean | default false |
| sendSms | boolean | default false |
| publishedAt | timestamp | nullable |
| createdByUserId | UUID | FK → User.id |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

## Entity: AnnouncementRead

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| announcementId | UUID | FK → Announcement.id |
| userId | UUID | FK → User.id |
| readAt | timestamp | not null |

**Constraint**: Unique (announcementId, userId)

---

## Entity: Poll

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| question | string | not null, max 500 |
| status | enum | Active, Closed |
| closingDate | date | not null |
| createdByUserId | UUID | FK → User.id |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

## Entity: PollOption

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| pollId | UUID | FK → Poll.id |
| optionText | string | not null, max 200 |
| displayOrder | integer | not null |

## Entity: PollVote

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| pollId | UUID | FK → Poll.id |
| optionId | UUID | FK → PollOption.id |
| userId | UUID | FK → User.id |
| votedAt | timestamp | auto |

**Constraint**: Unique (pollId, userId) — one vote per resident per poll

---

## Entity: FeedbackForm

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| title | string | not null, max 200 |
| description | text | nullable |
| isActive | boolean | default true |
| createdByUserId | UUID | FK → User.id |
| createdAt | timestamp | auto |

## Entity: FeedbackQuestion

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| formId | UUID | FK → FeedbackForm.id |
| questionText | string | not null, max 500 |
| isRequired | boolean | default true |
| displayOrder | integer | not null |

## Entity: FeedbackResponse

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| formId | UUID | FK → FeedbackForm.id |
| userId | UUID | FK → User.id |
| answers | jsonb | not null — `[{ questionId, answer }]` |
| submittedAt | timestamp | auto |

---

## Entity: Event

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| title | string | not null, max 200 |
| description | text | nullable |
| location | string | nullable, max 200 |
| eventDate | date | not null |
| startTime | time | nullable |
| endTime | time | nullable |
| createdByUserId | UUID | FK → User.id |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

## Entity: EventRsvp

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| eventId | UUID | FK → Event.id |
| userId | UUID | FK → User.id |
| status | enum | Attending, NotAttending |
| respondedAt | timestamp | auto |

**Constraint**: Unique (eventId, userId)

---

## Entity: DeviceToken

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User.id |
| token | string | not null |
| platform | enum | Web, Android, iOS |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

**Constraint**: Unique (userId, token)
