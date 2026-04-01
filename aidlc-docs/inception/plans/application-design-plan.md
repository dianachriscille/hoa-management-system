# Application Design Plan — HOA Management System

## Overview
This plan defines the approach for designing the high-level component architecture of the HOA Management System.
Please answer all `[Answer]:` questions below, then let me know when done.

---

## Part 1: Design Questions

### Question 1
What architectural pattern should be used for the backend?

A) Monolithic — single deployable backend application with all modules inside
B) Modular Monolith — single deployment but with clearly separated internal modules
C) Microservices — each module (billing, maintenance, etc.) as an independent service
D) Serverless-first — AWS Lambda functions per domain, API Gateway as entry point
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 2
How should the frontend communicate with the backend?

A) REST API only
B) REST API + WebSockets for real-time features (e.g., maintenance status updates, gate guard live verification)
C) GraphQL API
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 3
Should the system use a single database or separate databases per module?

A) Single shared relational database (PostgreSQL on AWS RDS) for all modules
B) Primary relational database + separate cache (Redis/ElastiCache) for sessions and real-time data
C) Primary relational database + separate NoSQL store for documents/events metadata
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 4
How should the GCash payment integration be handled?

A) Direct integration — backend calls GCash API directly
B) Via a dedicated Payment Service that abstracts the payment gateway (easier to swap later)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 5
For the gate guard tablet interface, should it be a separate frontend application or part of the main web app?

A) Separate dedicated tablet web app (optimized for touch, minimal UI)
B) Same web app with a dedicated gate guard role view (responsive, role-based routing)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 6
How should file uploads (maintenance photos, incident report photos, documents) be handled?

A) Upload directly to AWS S3 via pre-signed URLs (frontend uploads directly, backend only stores metadata)
B) Upload through the backend API (backend streams to S3)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Part 2: Execution Checklist
*(Executed after plan approval)*

- [x] Step 1: Generate components.md — all system components with responsibilities
- [x] Step 2: Generate component-methods.md — method signatures per component
- [x] Step 3: Generate services.md — service layer definitions and orchestration
- [x] Step 4: Generate component-dependency.md — dependency matrix and data flow
- [x] Step 5: Generate application-design.md — consolidated design document
