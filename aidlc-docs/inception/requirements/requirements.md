# Requirements Document — HOA Management System

## Intent Analysis Summary

| Field | Detail |
|---|---|
| **User Request** | Web-based HOA Management System with responsive web + mobile views |
| **Request Type** | New Project (Greenfield) |
| **Scope Estimate** | System-wide — 5 major modules, 17+ feature areas |
| **Complexity Estimate** | Complex — multi-role, payment integration, real-time features, external integrations |
| **Delivery Approach** | Phased — core modules first, then advanced features |

---

## Users & Community Scale

- **Community Type**: Single HOA community
- **Scale**: Medium — 100 to 500 residential units
- **User Roles**:
  - Resident
  - HOA Board Member
  - Prorperty Manage

---

## Functional Requirements

### Module 1: Resident & Member Management
- FR-01: Residents can register and maintain a digital profile (name, unit number, contact details, vehicle info)
- FR-02: Property Manager and Board Members can view, search, and manage the resident directory
- FR-03: Role-based access control (RBAC) — Resident, Board Member, Property Manager roles with distinct permissions
- FR-04: Email/password authentication for all users
- FR-05: Board Member and Property Manager accounts can be promoted/demoted by admins

### Module 2: Billing & Payments
- FR-06: System generates monthly/periodic HOA dues invoices per unit
- FR-07: Residents can view billing history and outstanding balances
- FR-08: Online payment via GCash payment gateway
- FR-09: Payment confirmation and receipt generation (email + in-app)
- FR-10: Property Manager can record manual/offline payments
- FR-11: Overdue payment tracking and automated reminder notifications
- FR-12: Financial dashboard showing total collected, outstanding, and overdue amounts

### Module 3: Maintenance Request Tracking
- FR-13: Residents can submit maintenance requests with description, location, and photo attachments
- FR-14: Property Manager can assign requests to maintenance staff or vendors
- FR-15: Status tracking: Submitted → Assigned → In Progress → Resolved → Closed
- FR-16: Residents receive notifications on status changes
- FR-17: Maintenance performance analytics (average resolution time, open vs. closed counts)

### Module 4: Amenity Booking
- FR-18: Residents can view amenity availability (social hall)
- FR-19: Residents can book amenities for specific dates and time slots
- FR-20: Booking rules: max advance booking days, max duration, one active booking per resident per amenity
- FR-21: Property Manager can manage amenity schedules, block dates, and approve/reject bookings
- FR-22: Booking confirmation and reminder notifications

### Module 5: Document Repository
- FR-23: Integration with Google Drive as the document storage backend
- FR-24: Documents organized by category: Policies, Meeting Minutes, Forms, Announcements, Violations
- FR-25: Board Members and Property Manager can upload, update, and delete documents
- FR-26: Residents can browse and download documents (read-only) except Violations specific to a resident
- FR-27: Document search by name and category

### Module 6: Communication Platform
- FR-28: Property Manager and Board Members can post community announcements
- FR-29: Push notifications delivered to residents for new announcements (FCM or AWS SNS — to be decided)
- FR-30: SMS alerts for urgent announcements (Twilio or AWS SNS — to be decided)
- FR-31: Online polls: Board can create polls, residents can vote, results visible after poll closes
- FR-32: Feedback forms: Board can publish forms, residents can submit responses
- FR-33: Event calendar: Board can create events with date, time, location, and description
- FR-34: Residents can RSVP to events; Board can view RSVP counts

### Module 7: Security & Access Control
- FR-35: Residents can issue digital visitor passes (visitor name, date/time window, unit number)
- FR-36: Visitor passes displayed as QR codes on resident's device
- FR-37: Gate guard tablet interface: guards can scan or manually look up visitor passes
- FR-38: Live resident verification: gate guard can confirm resident identity and unit
- FR-39: Residents and guards can submit incident reports (description, date/time, location, photo)
- FR-40: Incident reports visible on HOA dashboard for Board and Property Manager

### Module 8: Analytics & Reporting
- FR-41: Financial dashboard: budget vs. actual expenses, collection rate, overdue aging report
- FR-42: Maintenance analytics: open/closed requests, average resolution time, requests by category
- FR-43: Resident engagement metrics: poll participation rate, event RSVP rate, announcement read rate
- FR-44: Reports exportable as PDF or CSV

---

## Non-Functional Requirements

### Performance
- NFR-01: Page load time < 3 seconds on standard broadband connection
- NFR-02: System supports up to 500 concurrent users without degradation
- NFR-03: API response time < 500ms for standard CRUD operations

### Scalability
- NFR-04: Architecture must support horizontal scaling on AWS
- NFR-05: Database must handle up to 500 units × 5 years of historical data without redesign

### Availability
- NFR-06: Target uptime of 99.5% (excluding scheduled maintenance)
- NFR-07: Scheduled maintenance windows communicated to users in advance

### Security
- NFR-08: All data in transit encrypted via TLS 1.2+
- NFR-09: All data at rest encrypted (AWS RDS encryption, S3 SSE)
- NFR-10: Passwords stored using bcrypt or Argon2 hashing
- NFR-11: RBAC enforced at both API and UI layers
- NFR-12: Session tokens expire after inactivity (configurable, default 30 minutes)

### Compliance — Philippines Data Privacy Act 2012 (RA 10173)
- NFR-13: Personal data collected only with explicit resident consent
- NFR-14: Residents have the right to access, correct, and request deletion of their personal data
- NFR-15: Data breach notification procedures must be documented and implementable within 72 hours
- NFR-16: A Data Privacy Officer (DPO) role must be designatable within the system
- NFR-17: Data retention policies must be configurable per data category
- NFR-18: Audit logs of data access and modifications must be maintained

### Usability
- NFR-19: Fully responsive web application — optimized for desktop, tablet, and mobile browsers
- NFR-20: UI must be accessible (WCAG 2.1 AA compliance)
- NFR-21: Gate guard tablet interface optimized for touch and low-light conditions

### Maintainability
- NFR-22: Codebase must follow consistent coding standards with linting enforced
- NFR-23: All APIs documented via OpenAPI/Swagger
- NFR-24: Environment-based configuration (dev, staging, production)

---

## Technical Context

| Concern | Decision |
|---|---|
| **Frontend** | Single responsive web application (React recommended) |
| **Backend** | To be recommended — Node.js (TypeScript) preferred given AWS target and real-time needs |
| **Cloud** | AWS |
| **Authentication** | Email/password + RBAC (AWS Cognito recommended) |
| **Payment Gateway** | GCash (Philippines) |
| **Push/SMS Notifications** | To be decided during NFR Requirements stage (FCM + Twilio or AWS SNS) |
| **Document Storage** | Google Drive or SharePoint integration |
| **Analytics Source of Truth** | HOA system (no external ERP integration) |
| **Gate Access** | Software-only, QR code-based visitor passes |

---

## Extension Configuration

| Extension | Status |
|---|---|
| Security Baseline | Disabled (opted out) |
| Property-Based Testing | Disabled (opted out) |

---

## Phased Delivery Plan (High-Level)

| Phase | Modules |
|---|---|
| Phase 1 — Core | Resident & Member Management, Billing & Payments, Authentication |
| Phase 2 — Operations | Maintenance Request Tracking, Amenity Booking, Document Repository |
| Phase 3 — Engagement | Communication Platform (announcements, polls, events) |
| Phase 4 — Security & Analytics | Security & Access Control, Analytics & Reporting |

---

## Success Criteria
- Residents can self-serve billing, maintenance, and bookings without calling the property manager
- Gate guards can verify visitors digitally without paper logs
- Board Members have real-time visibility into financials and maintenance performance
- System is compliant with the Philippines Data Privacy Act 2012
