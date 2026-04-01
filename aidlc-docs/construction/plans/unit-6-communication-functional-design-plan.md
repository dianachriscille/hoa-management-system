# Functional Design Plan — Unit 6: Communication Platform

## Unit Scope
- Announcements (create, draft, publish, push + SMS dispatch)
- Polls (create, vote, auto-close, results)
- Feedback forms (create, submit responses)
- Events (create, RSVP tracking)
- Engagement metrics (poll participation, RSVP rate, announcement open rate)
- Full NotificationModule (push via FCM/AWS SNS + SMS via Twilio/AWS SNS)

## Stories Covered
- 6.1 Post Community Announcement
- 6.2 Create and Vote in a Poll
- 6.3 Submit Feedback Form
- 6.4 Create Event and Track RSVPs

## Dependencies
- Unit 1 (auth, resident profiles, notification base)
- Units 3–5 complete

---

## Part 1: Clarifying Questions

### Question 1
For push notifications, which service should be used?

A) Firebase Cloud Messaging (FCM) — best for web + mobile push
B) AWS SNS — simpler if already on AWS, supports web push via FCM integration
C) Both — FCM for web push, AWS SNS as fallback/SMS
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2
For SMS alerts, which service should be used?

A) Twilio — widely used, reliable, easy Philippines number support
B) AWS SNS SMS — simpler if already on AWS
C) No SMS — push notifications only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3
Should polls support multiple-choice (select one) or multi-select (select multiple options)?

A) Single choice only — resident picks one option
B) Multi-select — resident can pick multiple options
C) Both — poll creator chooses the type
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 4
Should announcement open/read tracking be implemented (tracking which residents opened each announcement)?

A) Yes — track per-resident open status for engagement metrics
B) No — track total view count only (simpler)
C) No tracking — engagement metrics based on poll/RSVP participation only
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 5
Should events support a maximum attendee capacity (limit RSVPs)?

A) Yes — event creator sets max capacity; booking closes when full
B) No — unlimited RSVPs
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Part 2: Execution Checklist
*(Executed after plan approval)*

- [ ] Step 1: Generate domain-entities.md
- [ ] Step 2: Generate business-rules.md
- [ ] Step 3: Generate business-logic-model.md
- [ ] Step 4: Generate frontend-components.md
