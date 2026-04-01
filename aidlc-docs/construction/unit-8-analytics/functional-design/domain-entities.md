# Domain Entities — Unit 8: Analytics & Reporting

## Entity: MonthlyBudget

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| period | string | not null, format YYYY-MM, unique |
| budgetAmount | decimal(10,2) | not null |
| createdByUserId | UUID | FK → User.id |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

**Notes**: PM enters one budget record per month. Used for budget vs. actual comparison.

---

## No new entities for other dashboards
Maintenance, engagement, and financial collection metrics are computed from existing tables:
- Financial collection: `invoice` table
- Maintenance: `maintenance_request` table
- Engagement: `poll_vote`, `event_rsvp`, `announcement_read` tables
