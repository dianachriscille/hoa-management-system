# Business Rules — Unit 8: Analytics & Reporting

## Access Rules
| ID | Rule |
|---|---|
| ANA-01 | All dashboards accessible to BoardMember and PropertyManager only |
| ANA-02 | Export accessible to BoardMember and PropertyManager only |

## Financial Dashboard Rules
| ID | Rule |
|---|---|
| FIN-01 | PM can create/update one MonthlyBudget record per period (YYYY-MM) |
| FIN-02 | Financial dashboard shows: budget amount, total invoiced, total collected, total outstanding, collection rate, overdue aging |
| FIN-03 | Collection rate = (total paid invoices / total invoices) × 100% |
| FIN-04 | Overdue aging buckets: 1–7 days, 8–14 days, 15–30 days, 30+ days |
| FIN-05 | If no budget set for period: budget amount shown as "Not set" |

## Maintenance Dashboard Rules
| ID | Rule |
|---|---|
| MAINT-01 | Shows: total open, total closed in period, avg resolution time (days), breakdown by category |
| MAINT-02 | Avg resolution time = AVG(closed_at - created_at) for Closed requests in period |

## Engagement Dashboard Rules
| ID | Rule |
|---|---|
| ENG-01 | Poll participation rate = unique voters / total active residents × 100% |
| ENG-02 | Event RSVP rate = Attending RSVPs / total active residents × 100% |
| ENG-03 | Announcement open rate = unique readers / total active residents × 100% |

## Export Rules
| ID | Rule |
|---|---|
| EXP-01 | PDF generated server-side using pdfkit |
| EXP-02 | CSV generated server-side using json2csv or manual string building |
| EXP-03 | Both formats returned as file download (Content-Disposition: attachment) |
| EXP-04 | Export includes date range and report type in filename: `hoa-financial-2025-07.pdf` |
| EXP-05 | If no data for period: export returns empty report with header row (CSV) or "No data" message (PDF) |
