# Functional Design Plan — Unit 8: Analytics & Reporting

## Unit Scope
- Financial dashboard (budget vs. actual, collection rate, overdue aging)
- Maintenance performance dashboard (open/closed, avg resolution time, by category)
- Resident engagement metrics (poll participation, RSVP rate, announcement open rate)
- Date range filtering on all dashboards
- PDF and CSV report export

## Stories Covered
- 8.1 View Financial Dashboard
- 8.2 View Maintenance Performance Analytics
- 8.3 View Resident Engagement Metrics
- 8.4 Export Reports

## Dependencies
- Units 1–7 complete (aggregates data from all modules)

---

## Part 1: Clarifying Questions

### Question 1
For the financial dashboard, should "budget vs. actual expenses" require a separate budget entry system, or should it use invoice collection data only?

A) Invoice collection data only — show total invoiced, total collected, total outstanding, collection rate
B) Budget entry system — PM enters monthly budget, dashboard shows budget vs. actual spending
C) Both — collection metrics + simple budget entry
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 2
What export formats should be supported?

A) PDF only
B) CSV only
C) Both PDF and CSV
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Question 3
Should exported reports be downloadable immediately (synchronous) or generated in the background and emailed?

A) Immediate download — generated synchronously, returned as file response
B) Background generation — queued via BullMQ, emailed when ready
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Part 2: Execution Checklist
*(Executed after plan approval)*

- [ ] Step 1: Generate domain-entities.md
- [ ] Step 2: Generate business-rules.md
- [ ] Step 3: Generate business-logic-model.md
- [ ] Step 4: Generate frontend-components.md
