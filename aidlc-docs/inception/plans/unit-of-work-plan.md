# Unit of Work Plan — HOA Management System

## Overview
This plan defines how the HOA Management System is decomposed into 8 units of work for the Construction Phase.
The 8 units were established in the Execution Plan and Application Design. This stage finalizes boundaries, dependencies, development sequence, and code organization.

Please answer all `[Answer]:` questions below, then let me know when done.

---

## Part 1: Planning Questions

### Question 1
How should units be developed during the Construction Phase?

A) Strictly sequential — complete Unit 1 fully before starting Unit 2
B) Phase-grouped sequential — complete all Phase 1 units before Phase 2 units, but units within the same phase can overlap
C) Fully parallel — all units developed simultaneously by different team members
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 2
What should the backend code directory structure look like for the Modular Monolith?

A) Feature-based — `src/modules/auth/`, `src/modules/billing/`, `src/modules/maintenance/`, etc.
B) Layer-based — `src/controllers/`, `src/services/`, `src/repositories/`, with sub-folders per module
C) Domain-based — `src/domain/billing/`, `src/domain/maintenance/`, each with its own controllers/services/repos
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3
What should the frontend code directory structure look like?

A) Feature-based — `src/features/auth/`, `src/features/billing/`, `src/features/maintenance/`, etc.
B) Page-based — `src/pages/`, `src/components/`, `src/hooks/`, `src/services/`
C) Domain-based — mirrors backend domain structure
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 4
Should Unit 1 (Foundation) include the full infrastructure setup (AWS RDS, Redis, S3, ECS, CloudFront) as part of its scope, or should infrastructure be a separate unit?

A) Yes — Unit 1 includes full infrastructure setup (IaC with AWS CDK or Terraform)
B) No — infrastructure setup is a separate Unit 0 that runs before all other units
C) Infrastructure is handled manually / outside the AI-DLC scope
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Part 2: Execution Checklist
*(Executed after plan approval)*

- [x] Step 1: Generate unit-of-work.md — 8 unit definitions with scope, components, and code organization
- [x] Step 2: Generate unit-of-work-dependency.md — dependency matrix and development sequence
- [x] Step 3: Generate unit-of-work-story-map.md — mapping of all 31 stories to their units
