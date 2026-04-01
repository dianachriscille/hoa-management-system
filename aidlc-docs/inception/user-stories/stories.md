# User Stories — HOA Management System

**Approach**: Hybrid — 8 epics (one per module), stories per persona within each epic
**Granularity**: Medium — one story per functional requirement group
**Acceptance Criteria**: Comprehensive BDD-style (Given/When/Then + edge cases + error paths)
**Phase Tags**: Phase 1 (Core) | Phase 2 (Operations) | Phase 3 (Engagement) | Phase 4 (Security & Analytics)

---

# Epic 1: Resident & Member Management

## Story 1.1 — Resident Self-Registration
**Phase**: 1
**As a** Resident,
**I want to** register an account and create my digital profile,
**So that** I can access all HOA services online without visiting the office.

### Acceptance Criteria
**Given** I am a new resident visiting the registration page,
**When** I submit my name, unit number, email, password, and contact number,
**Then** my account is created, I receive a verification email, and I am redirected to my dashboard.

**Given** I submit a unit number that is already registered to another account,
**When** I attempt to register,
**Then** the system displays an error: "This unit number is already registered. Please contact the property manager."

**Given** I submit an email address already in use,
**When** I attempt to register,
**Then** the system displays an error: "An account with this email already exists."

**Given** I have not verified my email after 24 hours,
**When** I try to log in,
**Then** the system prompts me to resend the verification email before granting access.

---

## Story 1.2 — Resident Profile Management
**Phase**: 1
**As a** Resident,
**I want to** update my profile information (contact number, vehicle details, emergency contact),
**So that** the HOA always has my current information on file.

### Acceptance Criteria
**Given** I am logged in and on my profile page,
**When** I update my contact number and save,
**Then** the changes are saved and a confirmation message is displayed.

**Given** I attempt to change my unit number,
**When** I submit the change,
**Then** the system rejects it with: "Unit number changes must be requested through the property manager."

**Given** I upload a profile photo larger than 5MB,
**When** I attempt to save,
**Then** the system displays: "Photo must be under 5MB. Please upload a smaller file."

---

## Story 1.3 — Resident Directory Access
**Phase**: 1
**As a** Property Manager,
**I want to** search and view the resident directory,
**So that** I can quickly find resident contact details and unit information.

### Acceptance Criteria
**Given** I am logged in as Property Manager,
**When** I search by name or unit number,
**Then** matching resident profiles are displayed with name, unit, contact number, and account status.

**Given** no residents match my search query,
**When** I submit the search,
**Then** the system displays: "No residents found matching your search."

**Given** I am logged in as a Resident,
**When** I attempt to access the full resident directory,
**Then** access is denied and I see only my own profile.

---

## Story 1.4 — User Role Management
**Phase**: 1
**As a** Property Manager,
**I want to** assign and update user roles (Resident, Board Member, Property Manager),
**So that** each user has the correct permissions in the system.

### Acceptance Criteria
**Given** I am logged in as Property Manager,
**When** I promote a Resident to Board Member and save,
**Then** the user's role is updated and they receive an email notification of their new role.

**Given** I attempt to demote the last remaining Property Manager account,
**When** I submit the change,
**Then** the system rejects it with: "At least one Property Manager account must exist at all times."

---

# Epic 2: Billing & Payments

## Story 2.1 — View Invoice and Billing History
**Phase**: 1
**As a** Resident,
**I want to** view my current invoice and past billing history,
**So that** I know exactly what I owe and what I have already paid.

### Acceptance Criteria
**Given** I am logged in and navigate to Billing,
**When** the page loads,
**Then** I see my current outstanding balance, due date, and a list of past invoices with status (Paid / Unpaid / Overdue).

**Given** I click on a past invoice,
**When** the detail view opens,
**Then** I see the invoice date, amount, breakdown of charges, and payment receipt if paid.

**Given** I have no billing history yet,
**When** I open the Billing page,
**Then** the system displays: "No invoices found. Your first invoice will appear here when generated."

---

## Story 2.2 — Pay HOA Dues via GCash
**Phase**: 1
**As a** Resident,
**I want to** pay my HOA dues online using GCash,
**So that** I can settle my balance without going to the office.

### Acceptance Criteria
**Given** I have an outstanding invoice and click "Pay Now",
**When** I am redirected to the GCash payment flow and complete payment,
**Then** my invoice is marked as Paid, I receive an in-app confirmation, and a receipt is sent to my email.

**Given** my GCash payment fails or is cancelled,
**When** I return to the app,
**Then** my invoice remains Unpaid and I see: "Payment was not completed. Please try again."

**Given** I attempt to pay an invoice that is already marked Paid,
**When** I click "Pay Now",
**Then** the button is disabled and the invoice shows "Already Paid."

---

## Story 2.3 — Record Manual Payment
**Phase**: 1
**As a** Property Manager,
**I want to** record a manual/offline payment for a resident,
**So that** cash or cheque payments are reflected in the system.

### Acceptance Criteria
**Given** I select a resident's unpaid invoice and choose "Record Manual Payment",
**When** I enter the amount, payment method, and reference number and save,
**Then** the invoice is marked as Paid and the resident receives an email confirmation.

**Given** I enter an amount less than the invoice total,
**When** I save,
**Then** the invoice is marked as Partially Paid and the remaining balance is shown.

---

## Story 2.4 — Overdue Payment Reminders
**Phase**: 1
**As a** Property Manager,
**I want** the system to automatically send reminders to residents with overdue balances,
**So that** I don't have to manually chase payments.

### Acceptance Criteria
**Given** a resident's invoice is 7 days past due,
**When** the daily reminder job runs,
**Then** the resident receives a push notification and email: "Your HOA dues are overdue. Please settle your balance to avoid penalties."

**Given** a resident's invoice is 30 days past due,
**When** the reminder job runs,
**Then** the Property Manager is also notified of the overdue account.

**Given** a resident has already paid,
**When** the reminder job runs,
**Then** no reminder is sent to that resident.

---

## Story 2.5 — Generate Invoice
**Phase**: 1
**As a** Property Manager,
**I want to** generate monthly HOA dues invoices for all units,
**So that** residents are billed accurately and on time each month.

### Acceptance Criteria
**Given** I navigate to Billing and click "Generate Monthly Invoices",
**When** I confirm the billing period and amount,
**Then** invoices are created for all active units and residents are notified via push notification and email.

**Given** a unit has no active resident account,
**When** invoices are generated,
**Then** that unit is skipped and flagged in the generation summary report.

---

# Epic 3: Maintenance Request Tracking

## Story 3.1 — Submit Maintenance Request
**Phase**: 2
**As a** Resident,
**I want to** submit a maintenance request with a description and photo,
**So that** the property manager is aware of the issue and can act on it.

### Acceptance Criteria
**Given** I navigate to Maintenance and click "New Request",
**When** I fill in the issue description, location, and optionally attach a photo, then submit,
**Then** the request is created with status "Submitted" and I receive a confirmation notification.

**Given** I submit without a description,
**When** I click Submit,
**Then** the system displays: "Please describe the issue before submitting."

**Given** I attach a photo larger than 10MB,
**When** I attempt to submit,
**Then** the system displays: "Photo must be under 10MB."

---

## Story 3.2 — Assign Maintenance Request
**Phase**: 2
**As a** Property Manager,
**I want to** assign a maintenance request to a staff member,
**So that** the right person is responsible for resolving it.

### Acceptance Criteria
**Given** I view an unassigned maintenance request,
**When** I select a staff member from the assignee list and save,
**Then** the request status changes to "Assigned" and the assigned staff member is notified.

**Given** no staff members are available in the system,
**When** I try to assign,
**Then** the system displays: "No staff members found. Please add staff accounts first."

---

## Story 3.3 — Track Maintenance Request Status
**Phase**: 2
**As a** Resident,
**I want to** track the status of my submitted maintenance requests,
**So that** I know whether my issue is being worked on without calling the office.

### Acceptance Criteria
**Given** I navigate to My Requests,
**When** the page loads,
**Then** I see all my requests with their current status: Submitted / Assigned / In Progress / Resolved / Closed.

**Given** my request status changes,
**When** the update is saved by the Property Manager,
**Then** I receive a push notification: "Your maintenance request #[ID] has been updated to [Status]."

**Given** I click on a request,
**When** the detail view opens,
**Then** I see the full history of status changes with timestamps.

---

## Story 3.4 — Update Request Status
**Phase**: 2
**As a** Property Manager,
**I want to** update the status of a maintenance request as work progresses,
**So that** residents and board members have real-time visibility.

### Acceptance Criteria
**Given** I open an assigned request,
**When** I change the status to "In Progress" and add a note, then save,
**Then** the status is updated, the note is logged, and the resident is notified.

**Given** I mark a request as "Resolved",
**When** I save,
**Then** the resident receives a notification and is prompted to confirm resolution or reopen.

**Given** the resident confirms resolution,
**When** they click "Confirm",
**Then** the request status changes to "Closed."

---

# Epic 4: Amenity Booking

## Story 4.1 — View Amenity Availability
**Phase**: 2
**As a** Resident,
**I want to** view the availability calendar for amenities,
**So that** I can choose a suitable date and time before booking.

### Acceptance Criteria
**Given** I navigate to Amenity Booking,
**When** I select an amenity (e.g., Social Hall),
**Then** I see a calendar showing available (green) and unavailable (grey) time slots for the next 30 days.

**Given** an amenity is under maintenance,
**When** I view its calendar,
**Then** the blocked dates are shown with the label "Unavailable."

---

## Story 4.2 — Book an Amenity
**Phase**: 2
**As a** Resident,
**I want to** book an amenity for a specific date and time slot,
**So that** I can reserve it for my use without conflicts.

### Acceptance Criteria
**Given** I select an available time slot and click "Book",
**When** I confirm the booking details,
**Then** the booking is created with status "Confirmed" and I receive a confirmation notification.

**Given** I already have an active booking for the same amenity,
**When** I attempt to book again,
**Then** the system displays: "You already have an active booking for this amenity. Please cancel it before making a new one."

**Given** the time slot becomes unavailable between my selection and confirmation,
**When** I confirm,
**Then** the system displays: "This slot is no longer available. Please choose another time."

---

## Story 4.3 — Manage Amenity Schedule
**Phase**: 2
**As a** Property Manager,
**I want to** block amenity dates and manage booking rules,
**So that** amenities are not booked during maintenance or reserved events.

### Acceptance Criteria
**Given** I navigate to Amenity Management and select an amenity,
**When** I block a date range and add a reason, then save,
**Then** those dates are marked unavailable and existing bookings in that range are cancelled with resident notification.

**Given** I update the maximum advance booking days from 30 to 14,
**When** I save,
**Then** residents can no longer book more than 14 days in advance.

---

## Story 4.4 — Cancel a Booking
**Phase**: 2
**As a** Resident,
**I want to** cancel my amenity booking,
**So that** the slot is freed up for other residents.

### Acceptance Criteria
**Given** I have a confirmed booking and click "Cancel",
**When** I confirm the cancellation,
**Then** the booking is cancelled, the slot is freed, and I receive a cancellation confirmation.

**Given** I try to cancel a booking less than 24 hours before the scheduled time,
**When** I click "Cancel",
**Then** the system warns: "Cancellations within 24 hours may be subject to HOA policy. Do you wish to proceed?"

---

# Epic 5: Document Repository

## Story 5.1 — Browse and Download Documents
**Phase**: 2
**As a** Resident,
**I want to** browse and download HOA documents,
**So that** I can access policies, forms, and meeting minutes without requesting them from the office.

### Acceptance Criteria
**Given** I navigate to Documents,
**When** the page loads,
**Then** I see documents organized by category: Policies, Meeting Minutes, Forms, Announcements.

**Given** I click on a document,
**When** it opens,
**Then** I can view it inline or download it to my device.

**Given** I search for a document by name,
**When** results are returned,
**Then** only documents matching the search term are shown.

---

## Story 5.2 — Upload and Manage Documents
**Phase**: 2
**As a** Property Manager,
**I want to** upload, update, and delete documents in the repository,
**So that** residents always have access to the latest versions.

### Acceptance Criteria
**Given** I click "Upload Document" and select a file with a category and title,
**When** I confirm the upload,
**Then** the document appears in the correct category and is accessible to residents.

**Given** I upload a file with the same name as an existing document,
**When** I confirm,
**Then** the system asks: "A document with this name already exists. Replace it or save as a new version?"

**Given** I delete a document,
**When** I confirm deletion,
**Then** the document is removed and residents can no longer access it.

---

# Epic 6: Communication Platform

## Story 6.1 — Post Community Announcement
**Phase**: 3
**As a** HOA Board Member,
**I want to** post a community announcement,
**So that** all residents are informed of important updates.

### Acceptance Criteria
**Given** I navigate to Announcements and click "New Announcement",
**When** I enter a title, body, and choose to send push notification, then publish,
**Then** the announcement is posted and all residents receive a push notification.

**Given** I choose to also send an SMS alert,
**When** I publish,
**Then** an SMS is sent to all residents with a registered mobile number.

**Given** I save the announcement as a draft,
**When** I return to Announcements,
**Then** the draft is listed separately and not visible to residents until published.

---

## Story 6.2 — Create and Vote in a Poll
**Phase**: 3
**As a** HOA Board Member,
**I want to** create an online poll,
**So that** I can gather resident feedback on community decisions.

### Acceptance Criteria
**Given** I create a poll with a question and multiple options and set a closing date,
**When** I publish it,
**Then** residents are notified and can vote until the closing date.

**Given** I am a Resident and open an active poll,
**When** I select an option and submit,
**Then** my vote is recorded and I see: "Your vote has been submitted."

**Given** I try to vote a second time,
**When** I submit,
**Then** the system displays: "You have already voted in this poll."

**Given** the poll closing date passes,
**When** any user views the poll,
**Then** voting is disabled and results are displayed to all residents.

---

## Story 6.3 — Submit Feedback Form
**Phase**: 3
**As a** Resident,
**I want to** submit a feedback form published by the Board,
**So that** my opinions are captured and considered by the HOA.

### Acceptance Criteria
**Given** a feedback form is published and I navigate to it,
**When** I fill in all required fields and submit,
**Then** my response is recorded and I see a confirmation message.

**Given** I try to submit with required fields empty,
**When** I click Submit,
**Then** the system highlights the empty fields and displays: "Please complete all required fields."

---

## Story 6.4 — Create Event and Track RSVPs
**Phase**: 3
**As a** HOA Board Member,
**I want to** create a community event and track RSVPs,
**So that** I can plan logistics based on expected attendance.

### Acceptance Criteria
**Given** I create an event with title, date, time, location, and description,
**When** I publish it,
**Then** the event appears on the community calendar and residents are notified.

**Given** I am a Resident and open an event,
**When** I click "RSVP — Attending",
**Then** my RSVP is recorded and I receive a calendar reminder notification.

**Given** I am a Board Member viewing the event,
**When** I open the RSVP list,
**Then** I see the count of attending, not attending, and no response residents.

---

# Epic 7: Security & Access Control

## Story 7.1 — Issue Digital Visitor Pass
**Phase**: 4
**As a** Resident,
**I want to** issue a digital visitor pass for my guest,
**So that** they can enter the community without me having to be at the gate.

### Acceptance Criteria
**Given** I navigate to Visitor Passes and click "New Pass",
**When** I enter the visitor's name, date, and valid time window, then confirm,
**Then** a QR code pass is generated and displayed on my screen, and I can share it with my guest.

**Given** I try to create a pass with a past date,
**When** I submit,
**Then** the system displays: "Visitor pass date must be today or a future date."

**Given** a pass has expired (past its valid time window),
**When** the gate guard scans it,
**Then** the system shows: "This pass has expired" and denies entry.

---

## Story 7.2 — Verify Visitor Pass at Gate
**Phase**: 4
**As a** Gate Guard,
**I want to** scan or look up a visitor's QR code pass,
**So that** I can quickly verify if they have a valid pass to enter.

### Acceptance Criteria
**Given** I scan a valid QR code pass,
**When** the scan completes,
**Then** the screen shows the visitor's name, the resident's unit number, and a green "VALID — Allow Entry" indicator.

**Given** I scan an expired or invalid QR code,
**When** the scan completes,
**Then** the screen shows a red "INVALID — Deny Entry" indicator with the reason (expired / not found).

**Given** the visitor does not have a QR code,
**When** I manually search by visitor name or resident unit,
**Then** matching passes are listed and I can verify manually.

---

## Story 7.3 — Verify Resident Identity
**Phase**: 4
**As a** Gate Guard,
**I want to** look up a resident by unit number,
**So that** I can confirm their identity when they enter or exit.

### Acceptance Criteria
**Given** I search for a unit number on the gate guard interface,
**When** the result loads,
**Then** I see the resident's name, profile photo, and unit number.

**Given** the unit number does not exist,
**When** I search,
**Then** the system displays: "No resident found for this unit number."

---

## Story 7.4 — Submit Incident Report
**Phase**: 4
**As a** Gate Guard,
**I want to** submit an incident report digitally,
**So that** the HOA board and property manager are immediately informed of security incidents.

### Acceptance Criteria
**Given** I navigate to Incident Report and fill in the description, location, date/time, and optionally attach a photo,
**When** I submit,
**Then** the report is created and immediately visible on the HOA dashboard for Board Members and Property Manager.

**Given** I submit without a description,
**When** I click Submit,
**Then** the system displays: "Please provide an incident description."

**Given** I am a Resident submitting an incident report,
**When** I submit,
**Then** the report is created and flagged for Property Manager review.

---

# Epic 8: Analytics & Reporting

## Story 8.1 — View Financial Dashboard
**Phase**: 4
**As a** HOA Board Member,
**I want to** view a financial dashboard showing budget vs. actual expenses and collection rates,
**So that** I can monitor the HOA's financial health at a glance.

### Acceptance Criteria
**Given** I navigate to Analytics > Financial,
**When** the dashboard loads,
**Then** I see total collected this month, total outstanding, overdue aging breakdown, and budget vs. actual expense chart.

**Given** I select a specific month from the date filter,
**When** I apply the filter,
**Then** all dashboard figures update to reflect that month's data.

**Given** no financial data exists for the selected period,
**When** the dashboard loads,
**Then** the system displays: "No financial data available for this period."

---

## Story 8.2 — View Maintenance Performance Analytics
**Phase**: 4
**As a** Property Manager,
**I want to** view maintenance analytics showing open vs. closed requests and average resolution time,
**So that** I can identify bottlenecks and improve service quality.

### Acceptance Criteria
**Given** I navigate to Analytics > Maintenance,
**When** the dashboard loads,
**Then** I see total open requests, total closed this month, average resolution time in days, and a breakdown by category.

**Given** I click on a category bar in the chart,
**When** the drill-down opens,
**Then** I see the list of requests in that category with their statuses and resolution times.

---

## Story 8.3 — View Resident Engagement Metrics
**Phase**: 4
**As a** HOA Board Member,
**I want to** view resident engagement metrics (poll participation, event RSVPs, announcement reads),
**So that** I can assess how actively residents are using the platform.

### Acceptance Criteria
**Given** I navigate to Analytics > Engagement,
**When** the dashboard loads,
**Then** I see poll participation rate (%), event RSVP rate (%), and announcement open rate (%) for the current month.

**Given** I select a date range,
**When** I apply the filter,
**Then** all metrics update to reflect the selected period.

---

## Story 8.4 — Export Reports
**Phase**: 4
**As a** Property Manager,
**I want to** export analytics reports as PDF or CSV,
**So that** I can share them with the board or keep records offline.

### Acceptance Criteria
**Given** I am viewing any analytics dashboard,
**When** I click "Export" and choose PDF or CSV,
**Then** the file is generated and downloaded to my device within 10 seconds.

**Given** the report contains no data,
**When** I attempt to export,
**Then** the system displays: "No data available to export for the selected period."

---

# Story Summary

| Epic | Stories | Personas Covered | Phase |
|---|---|---|---|
| 1 — Resident & Member Management | 4 | Resident, Property Manager | 1 |
| 2 — Billing & Payments | 5 | Resident, Property Manager | 1 |
| 3 — Maintenance Request Tracking | 4 | Resident, Property Manager | 2 |
| 4 — Amenity Booking | 4 | Resident, Property Manager | 2 |
| 5 — Document Repository | 2 | Resident, Property Manager | 2 |
| 6 — Communication Platform | 4 | Resident, Board Member | 3 |
| 7 — Security & Access Control | 4 | Resident, Gate Guard, Board Member, Property Manager | 4 |
| 8 — Analytics & Reporting | 4 | Board Member, Property Manager | 4 |
| **Total** | **31 stories** | **All 4 personas** | **Phases 1–4** |
