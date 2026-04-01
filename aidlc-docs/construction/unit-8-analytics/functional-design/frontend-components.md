# Frontend Components — Unit 8: Analytics & Reporting

## Feature: analytics (`src/features/analytics/`)

```
AnalyticsDashboardPage
├── PeriodFilter (month/year picker)
├── TabNav (Financial / Maintenance / Engagement)
│
├── FinancialTab
│   ├── BudgetCard (budget amount + set/edit button for PM)
│   ├── CollectionSummaryCards (invoiced, collected, outstanding, rate)
│   ├── OverdueAgingTable (4 buckets)
│   └── ExportButtons (PDF + CSV)
│
├── MaintenanceTab
│   ├── SummaryCards (open, closed, avg resolution days)
│   ├── CategoryBreakdownChart (bar chart)
│   └── ExportButtons (PDF + CSV)
│
└── EngagementTab
    ├── MetricCards (poll participation %, RSVP rate %, announcement open rate %)
    └── ExportButtons (PDF + CSV)
```

## API Integration Points
| Component | Endpoint | Method |
|---|---|---|
| FinancialTab | `/analytics/financial?period=` | GET |
| BudgetCard (set) | `/analytics/budget` | POST |
| MaintenanceTab | `/analytics/maintenance?start=&end=` | GET |
| EngagementTab | `/analytics/engagement?start=&end=` | GET |
| ExportButtons | `/analytics/export?type=&period=&format=` | GET (file download) |
