# Business Rules — Unit 6: Communication Platform

## Announcement Rules

| ID | Rule |
|---|---|
| ANN-01 | Only BoardMember and PropertyManager can create/publish announcements |
| ANN-02 | Announcements can be saved as Draft before publishing |
| ANN-03 | On publish: if sendPush = true → dispatch FCM push to all residents with registered device tokens |
| ANN-04 | On publish: if sendSms = true → dispatch Twilio SMS to all residents with registered phone numbers |
| ANN-05 | Published announcements cannot be unpublished or deleted |
| ANN-06 | Per-resident read tracking: AnnouncementRead record created when resident opens announcement |
| ANN-07 | Duplicate read records prevented by unique constraint (announcementId, userId) |

## Poll Rules

| ID | Rule |
|---|---|
| POLL-01 | Only BoardMember and PropertyManager can create polls |
| POLL-02 | Poll must have at least 2 options |
| POLL-03 | Resident can vote only once per poll (unique constraint on pollId + userId) |
| POLL-04 | Voting disabled after closingDate |
| POLL-05 | Poll auto-closes on closingDate via BullMQ scheduled job |
| POLL-06 | Results visible to all users after poll closes |
| POLL-07 | Results hidden while poll is Active (prevents bandwagon effect) |
| POLL-08 | On close: residents notified via push "Poll results are now available" |

## Feedback Form Rules

| ID | Rule |
|---|---|
| FORM-01 | Only BoardMember and PropertyManager can create feedback forms |
| FORM-02 | Residents can submit one response per form |
| FORM-03 | Required questions must be answered before submission |
| FORM-04 | Responses visible only to BoardMember and PropertyManager |
| FORM-05 | Forms can be deactivated (isActive = false) — no new submissions accepted |

## Event Rules

| ID | Rule |
|---|---|
| EVT-01 | Only BoardMember and PropertyManager can create events |
| EVT-02 | Residents can RSVP as Attending or NotAttending |
| EVT-03 | Resident can change their RSVP before the event date |
| EVT-04 | RSVP count (Attending) visible to all users |
| EVT-05 | Full RSVP list visible to BoardMember and PropertyManager only |
| EVT-06 | On event creation: residents notified via push |

## Notification Rules

| ID | Rule |
|---|---|
| NOTIF-01 | FCM push: dispatched via Firebase Admin SDK to all registered device tokens |
| NOTIF-02 | Twilio SMS: dispatched to all residents with contactNumber in ResidentProfile |
| NOTIF-03 | Failed FCM token (invalid/expired): token removed from DeviceToken table |
| NOTIF-04 | Twilio SMS failures: logged, do not block announcement publish |
| NOTIF-05 | Residents can register/update device tokens via POST /notifications/device-token |

## Engagement Metrics Rules

| ID | Rule |
|---|---|
| ENG-01 | Poll participation rate = (unique voters / total active residents) × 100% |
| ENG-02 | Event RSVP rate = (Attending RSVPs / total active residents) × 100% |
| ENG-03 | Announcement open rate = (unique readers / total active residents) × 100% |
| ENG-04 | Metrics filterable by date range |
| ENG-05 | Metrics visible to BoardMember and PropertyManager only |
