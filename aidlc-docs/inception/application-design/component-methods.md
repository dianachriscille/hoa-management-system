# Component Methods — HOA Management System

> Note: Detailed business rules and validation logic are defined in Functional Design (Construction Phase, per unit).
> This document covers method signatures, inputs, outputs, and high-level purpose only.

---

## BM-01: AuthModule

| Method | Input | Output | Purpose |
|---|---|---|---|
| register(data) | RegisterDto | UserDto | Create new user account |
| verifyEmail(token) | string | void | Verify email address |
| login(credentials) | LoginDto | AuthTokensDto | Authenticate user, issue JWT |
| refreshToken(token) | string | AuthTokensDto | Issue new access token |
| logout(userId) | string | void | Invalidate session |
| requestPasswordReset(email) | string | void | Send password reset email |
| resetPassword(token, password) | ResetPasswordDto | void | Update password |
| validateToken(token) | string | JwtPayloadDto | Validate and decode JWT |

---

## BM-02: ResidentModule

| Method | Input | Output | Purpose |
|---|---|---|---|
| createProfile(data) | CreateResidentDto | ResidentDto | Create resident profile |
| getProfile(userId) | string | ResidentDto | Get own profile |
| updateProfile(userId, data) | UpdateResidentDto | ResidentDto | Update profile fields |
| getDirectory(filters) | DirectoryFilterDto | ResidentDto[] | Get resident directory (PM only) |
| assignRole(userId, role) | AssignRoleDto | UserDto | Assign/change user role |
| requestDataDeletion(userId) | string | void | DPA 2012 — data deletion request |
| recordConsent(userId, consentData) | ConsentDto | void | DPA 2012 — record consent |

---

## BM-03: BillingModule

| Method | Input | Output | Purpose |
|---|---|---|---|
| generateMonthlyInvoices(period) | BillingPeriodDto | InvoiceSummaryDto | Batch generate invoices for all units |
| getInvoice(invoiceId) | string | InvoiceDto | Get invoice detail |
| getInvoicesByResident(userId) | string | InvoiceDto[] | Get resident billing history |
| initiateGCashPayment(invoiceId) | string | GCashPaymentUrlDto | Initiate GCash payment, return redirect URL |
| handleGCashWebhook(payload) | GCashWebhookDto | void | Process GCash payment confirmation |
| recordManualPayment(data) | ManualPaymentDto | InvoiceDto | Record offline payment |
| getOverdueInvoices() | void | InvoiceDto[] | Get all overdue invoices |
| sendOverdueReminders() | void | void | Dispatch reminders for overdue invoices |
| generateReceipt(invoiceId) | string | ReceiptDto | Generate payment receipt |

---

## BM-04: MaintenanceModule

| Method | Input | Output | Purpose |
|---|---|---|---|
| createRequest(data) | CreateMaintenanceDto | MaintenanceRequestDto | Submit new maintenance request |
| getRequest(requestId) | string | MaintenanceRequestDto | Get request detail with history |
| getRequestsByResident(userId) | string | MaintenanceRequestDto[] | Get resident's requests |
| getAllRequests(filters) | RequestFilterDto | MaintenanceRequestDto[] | Get all requests (PM view) |
| assignRequest(requestId, assigneeId) | AssignRequestDto | MaintenanceRequestDto | Assign request to staff |
| updateStatus(requestId, status, note) | UpdateStatusDto | MaintenanceRequestDto | Update request status |
| getPresignedUploadUrl(fileInfo) | FileInfoDto | PresignedUrlDto | Get S3 URL for photo upload |
| getAnalytics(filters) | AnalyticsFilterDto | MaintenanceAnalyticsDto | Get maintenance performance metrics |

---

## BM-05: AmenityModule

| Method | Input | Output | Purpose |
|---|---|---|---|
| getAmenities() | void | AmenityDto[] | List all amenities |
| getAvailability(amenityId, dateRange) | AvailabilityQueryDto | AvailabilityDto | Get availability calendar |
| createBooking(data) | CreateBookingDto | BookingDto | Create amenity booking |
| cancelBooking(bookingId, userId) | string | void | Cancel a booking |
| getBookingsByResident(userId) | string | BookingDto[] | Get resident's bookings |
| blockDates(amenityId, data) | BlockDatesDto | void | Block amenity dates (PM) |
| updateBookingRules(amenityId, rules) | BookingRulesDto | AmenityDto | Update booking rules (PM) |

---

## BM-06: DocumentModule

| Method | Input | Output | Purpose |
|---|---|---|---|
| listDocuments(filters) | DocumentFilterDto | DocumentDto[] | List documents by category |
| searchDocuments(query) | string | DocumentDto[] | Search documents by name |
| getDocumentUrl(documentId) | string | DocumentUrlDto | Get download/view URL |
| uploadDocument(data) | UploadDocumentDto | DocumentDto | Upload document metadata + file |
| updateDocument(documentId, data) | UpdateDocumentDto | DocumentDto | Update document metadata |
| deleteDocument(documentId) | string | void | Delete document |
| getOAuthUrl(provider) | string | OAuthUrlDto | Get Google Drive / SharePoint OAuth URL |
| handleOAuthCallback(code, provider) | OAuthCallbackDto | void | Handle OAuth callback, store tokens |

---

## BM-07: CommunicationModule

| Method | Input | Output | Purpose |
|---|---|---|---|
| createAnnouncement(data) | CreateAnnouncementDto | AnnouncementDto | Create announcement |
| publishAnnouncement(id, options) | PublishOptionsDto | AnnouncementDto | Publish + dispatch push/SMS |
| getAnnouncements(filters) | AnnouncementFilterDto | AnnouncementDto[] | List announcements |
| createPoll(data) | CreatePollDto | PollDto | Create poll |
| submitVote(pollId, userId, optionId) | VoteDto | void | Record resident vote |
| getPollResults(pollId) | string | PollResultsDto | Get poll results |
| createFeedbackForm(data) | CreateFormDto | FeedbackFormDto | Create feedback form |
| submitFeedback(formId, data) | FeedbackResponseDto | void | Submit feedback response |
| createEvent(data) | CreateEventDto | EventDto | Create community event |
| submitRsvp(eventId, userId, status) | RsvpDto | void | Submit RSVP |
| getEventRsvps(eventId) | string | RsvpSummaryDto | Get RSVP summary (Board) |
| getEngagementMetrics(filters) | MetricsFilterDto | EngagementMetricsDto | Get engagement metrics |

---

## BM-08: SecurityModule

| Method | Input | Output | Purpose |
|---|---|---|---|
| createVisitorPass(data) | CreateVisitorPassDto | VisitorPassDto | Create visitor pass with QR code |
| getVisitorPassesByResident(userId) | string | VisitorPassDto[] | Get resident's visitor passes |
| verifyVisitorPass(qrCode) | string | PassVerificationDto | Verify QR code at gate |
| lookupVisitorPass(query) | string | VisitorPassDto[] | Manual visitor pass lookup |
| verifyResident(unitNumber) | string | ResidentVerificationDto | Gate guard resident lookup |
| createIncidentReport(data) | CreateIncidentDto | IncidentReportDto | Submit incident report |
| getIncidentReports(filters) | IncidentFilterDto | IncidentReportDto[] | Get incident reports (Board/PM) |
| getPresignedUploadUrl(fileInfo) | FileInfoDto | PresignedUrlDto | Get S3 URL for incident photo |

---

## BM-09: AnalyticsModule

| Method | Input | Output | Purpose |
|---|---|---|---|
| getFinancialDashboard(filters) | FinancialFilterDto | FinancialDashboardDto | Get financial metrics |
| getMaintenanceDashboard(filters) | MaintenanceFilterDto | MaintenanceDashboardDto | Get maintenance metrics |
| getEngagementDashboard(filters) | EngagementFilterDto | EngagementDashboardDto | Get engagement metrics |
| exportReport(type, filters, format) | ExportRequestDto | ExportFileDto | Export report as PDF or CSV |

---

## BM-10: NotificationModule

| Method | Input | Output | Purpose |
|---|---|---|---|
| sendPushNotification(data) | PushNotificationDto | void | Dispatch push via FCM/SNS |
| sendSms(data) | SmsDto | void | Dispatch SMS via Twilio/SNS |
| createInAppNotification(data) | InAppNotificationDto | void | Store in-app notification |
| getNotifications(userId) | string | NotificationDto[] | Get user's notifications |
| markAsRead(notificationId) | string | void | Mark notification read |
| scheduleReminder(data) | ReminderDto | void | Schedule a future reminder |

---

## BM-11: FileModule

| Method | Input | Output | Purpose |
|---|---|---|---|
| generatePresignedUrl(data) | PresignedUrlRequestDto | PresignedUrlDto | Generate S3 pre-signed upload URL |
| recordUpload(data) | FileMetadataDto | FileDto | Record completed upload metadata |
| deleteFile(fileId) | string | void | Delete file from S3 and metadata |
| getFileUrl(fileId) | string | FileUrlDto | Get S3 pre-signed download URL |
