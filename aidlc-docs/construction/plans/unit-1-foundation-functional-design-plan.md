# Functional Design Plan — Unit 1: Foundation

## Unit Scope
- User registration, email verification, login, logout, password reset
- JWT + RBAC (Resident, Board Member, Property Manager, Gate Guard)
- Resident profile CRUD
- Resident directory (Property Manager)
- Role management (Property Manager)
- Philippines DPA 2012 — consent, data access/deletion
- Session management (Redis)
- Full AWS infrastructure IaC (CDK)

## Stories Covered
- 1.1 Resident Self-Registration
- 1.2 Resident Profile Management
- 1.3 Resident Directory Access
- 1.4 User Role Management

---

## Part 1: Clarifying Questions

### Question 1
What fields should be included in the Resident profile?

A) Core only — name, unit number, email, contact number, password
B) Core + extended — name, unit number, email, contact number, password, vehicle plate numbers (up to 2), emergency contact name and number
C) Core + extended + profile photo
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Question 2
How should unit number uniqueness be enforced?

A) One active resident account per unit number (strict — new registration blocked if unit already has an account)
B) Multiple accounts per unit allowed (e.g., husband and wife both register separately for the same unit)
C) One primary account per unit, with the ability to add secondary household members
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3
What is the JWT token expiry policy?

A) Short-lived access token (15 min) + long-lived refresh token (7 days)
B) Short-lived access token (1 hour) + long-lived refresh token (30 days)
C) Single token, no refresh (24-hour expiry)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 4
For Philippines DPA 2012 compliance, what personal data fields require explicit consent at registration?

A) All fields collected at registration (name, unit, email, contact number)
B) Only sensitive fields — contact number and vehicle details
C) A blanket consent checkbox covering all data collected by the HOA system
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 5
What is the data retention policy for resident personal data after account deletion or deactivation?

A) Immediate anonymization — PII replaced with placeholders on deletion request
B) Soft delete — data retained for 30 days then permanently deleted
C) Retain for 1 year (for billing/audit records), then permanently delete PII
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Question 6
For the AWS infrastructure IaC, which tool should be used?

A) AWS CDK (TypeScript) — consistent with the Node.js/TypeScript stack
B) Terraform — cloud-agnostic, widely used
C) AWS CloudFormation (raw YAML/JSON)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 7
Should the infrastructure support multiple deployment environments out of the box?

A) Yes — dev, staging, and production environments as separate CDK/Terraform stacks
B) Yes — dev and production only
C) No — single environment for now, multi-env can be added later
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Part 2: Execution Checklist
*(Executed after plan approval)*

- [x] Step 1: Generate domain-entities.md — User, Resident, Role, Consent, AuditLog entities
- [x] Step 2: Generate business-rules.md — registration rules, RBAC rules, DPA 2012 rules, token policies
- [x] Step 3: Generate business-logic-model.md — auth flows, profile management flows, DPA flows
- [x] Step 4: Generate frontend-components.md — auth and resident UI component hierarchy, state, forms
