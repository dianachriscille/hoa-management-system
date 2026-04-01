# Business Logic Model — Unit 6: Communication Platform

## Flow 1: Publish Announcement

```
1. Board/PM submits: title, body, sendPush, sendSms

2. Create Announcement (status = Published, publishedAt = now())

3. If sendPush = true:
   - Fetch all DeviceToken records
   - Dispatch FCM push via Firebase Admin SDK (batch)
   - Remove invalid tokens from DeviceToken table

4. If sendSms = true:
   - Fetch all ResidentProfile.contactNumber values
   - Dispatch Twilio SMS (async, non-blocking)
   - Log failures to CloudWatch

5. Log AuditLog: action = ANNOUNCEMENT_PUBLISHED

6. Return announcement
```

---

## Flow 2: Track Announcement Read

```
1. Resident opens announcement detail

2. POST /announcements/:id/read

3. Upsert AnnouncementRead (unique constraint prevents duplicates)

4. Return 200 (idempotent)
```

---

## Flow 3: Create Poll + Vote

```
CREATE POLL:
1. Board/PM submits: question, options[], closingDate
2. Validate: >= 2 options, closingDate >= today
3. Create Poll (status = Active) + PollOption records
4. Schedule BullMQ delayed job: close poll at closingDate end-of-day
5. Notify residents via push: "New poll: {question}"

VOTE:
1. Resident submits: pollId, optionId
2. Validate:
   - Poll status = Active
   - closingDate >= today
   - No existing PollVote for this resident + poll (unique constraint)
3. Create PollVote record
4. Return 200

AUTO-CLOSE (BullMQ):
1. Job fires at closingDate end-of-day
2. Set Poll.status = Closed
3. Notify residents: "Poll results are now available"
```

---

## Flow 4: Submit Feedback Form

```
1. Resident submits: formId, answers[]

2. Validate:
   - Form isActive = true
   - All required questions answered
   - No existing FeedbackResponse for this resident + form

3. Create FeedbackResponse with answers as JSONB

4. Return 201
```

---

## Flow 5: Create Event + RSVP

```
CREATE EVENT:
1. Board/PM submits: title, description, location, eventDate, startTime, endTime
2. Create Event record
3. Notify residents via push: "New event: {title} on {eventDate}"

RSVP:
1. Resident submits: eventId, status (Attending / NotAttending)
2. Upsert EventRsvp (unique constraint on eventId + userId)
3. Return updated RSVP

GET RSVP SUMMARY (all users):
- Return: attendingCount, notAttendingCount, noResponseCount

GET RSVP LIST (Board/PM only):
- Return full list with resident names
```

---

## Flow 6: Engagement Metrics

```
1. Board/PM requests metrics with date range

2. Compute:
   - Poll participation: COUNT(DISTINCT voter userId) / total active residents
   - RSVP rate: COUNT(Attending RSVPs) / total active residents (per event)
   - Announcement open rate: COUNT(DISTINCT reader userId) / total active residents (per announcement)

3. Return aggregated metrics
```
