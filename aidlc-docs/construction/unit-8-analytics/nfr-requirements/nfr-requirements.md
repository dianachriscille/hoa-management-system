# NFR Requirements — Unit 8: Analytics & Reporting

## Inherited NFRs
All Unit 1 base NFRs apply.

## Analytics-Specific NFRs
| ID | Requirement |
|---|---|
| PERF-AN01 | Dashboard endpoints < 1500ms p95 (complex aggregation queries) |
| PERF-AN02 | Export generation < 10 seconds for up to 500 records |
| SEC-AN01 | All analytics endpoints restricted to BoardMember and PropertyManager |
| REL-AN01 | Export failure returns 500 with user-friendly message, never partial file |
| RET-AN01 | MonthlyBudget records retained indefinitely |

## Tech Stack Additions
| Concern | Decision |
|---|---|
| PDF generation | `pdfkit` (already added in Unit 2) |
| CSV generation | Native string building (no additional library) |
| Query optimization | Raw SQL with indexes for aggregation queries |
