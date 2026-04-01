# Requirements Clarification Questions — HOA Management System

Please answer each question by filling in the letter choice after the `[Answer]:` tag.
If none of the options match your needs, choose the last option (X) and describe your preference.
Let me know when you're done.

---

## Question 1
Who are the primary user roles in the system?

A) Residents, HOA Board Members, and Property Manager only
B) Residents, HOA Board Members, Property Manager, Maintenance Staff, and Gate Guards
C) All of the above plus external vendors/contractors
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
Is this a single HOA community or a multi-community platform (managing multiple HOAs)?

A) Single HOA community
B) Multi-community (one platform serving multiple HOAs)
C) Start with single, but architect for future multi-community expansion
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
What is the expected number of residents/units per HOA community?

A) Small (< 100 units)
B) Medium (100 – 500 units)
C) Large (500 – 2,000 units)
D) Enterprise (2,000+ units)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 4
For the billing and payments module, which payment gateway should be integrated?

A) Stripe
B) PayPal
C) Square
D) We'll decide later / need recommendation
X) Other (please describe after [Answer]: tag below)

[Answer]: X GCash

---

## Question 5
For push notifications and SMS alerts, which services should be used?

A) Firebase Cloud Messaging (FCM) for push + Twilio for SMS
B) AWS SNS for both push and SMS
C) We'll decide later / need recommendation
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 6
For the gate guard tablet interface and visitor pass system, what hardware/access control integration is expected?

A) Software only — no physical hardware integration (QR code-based passes displayed on screen)
B) Integration with existing gate hardware (e.g., barrier arms, intercoms) via API
C) Not sure — needs further discovery
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7
What is the preferred frontend technology stack?

A) React (web) + React Native (mobile)
B) React (web) + Flutter (mobile)
C) Vue.js or Angular (web) + native mobile apps
D) Single responsive web app only (no native mobile app)
X) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 8
What is the preferred backend technology stack?

A) Node.js (TypeScript) with REST APIs
B) Python (FastAPI or Django) with REST APIs
C) Java / Kotlin (Spring Boot)
D) No preference — recommend based on best fit
X) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 9
What is the target cloud infrastructure?

A) AWS
B) Google Cloud Platform (GCP)
C) Microsoft Azure
D) No preference / not decided yet
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 10
What are the authentication and access control requirements?

A) Email/password login with role-based access control (RBAC)
B) Social login (Google, Apple) + email/password + RBAC
C) Single Sign-On (SSO) via an identity provider (e.g., Auth0, AWS Cognito, Okta)
D) Multi-factor authentication (MFA) required for board/admin roles
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 11
Are there any data residency or compliance requirements?

A) No specific requirements
B) GDPR (EU residents' data)
C) CCPA (California residents' data)
D) Both GDPR and CCPA
X) Other (please describe after [Answer]: tag below)

[Answer]: X Philippines Data Privacy Act 2012 (Republic Act No. 10173)

---

## Question 12
What is the document repository storage requirement?

A) Store documents in cloud object storage (e.g., AWS S3, Google Cloud Storage)
B) Integrate with an existing document management system (e.g., SharePoint, Google Drive)
C) No preference — recommend best approach
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 13
For the analytics and financial dashboards, is there an existing accounting or ERP system to integrate with?

A) No — the HOA system will be the source of truth for financials
B) Yes — integrate with QuickBooks
C) Yes — integrate with another system (describe after [Answer]: tag)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 14
What is the expected project delivery approach?

A) Build everything at once (full system delivery)
B) Phased delivery — core modules first, then advanced features
C) MVP first (minimum viable product), then iterate
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question: Security Extension
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with complex business logic, billing, and data transformations)
B) Partial — enforce PBT rules only for pure functions and serialization round-trips
C) No — skip all PBT rules
X) Other (please describe after [Answer]: tag below)

[Answer]: C
