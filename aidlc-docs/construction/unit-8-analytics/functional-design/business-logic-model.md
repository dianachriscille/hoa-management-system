# Business Logic Model — Unit 8: Analytics & Reporting

## Flow 1: Financial Dashboard
```
1. PM/Board requests financial dashboard for period (YYYY-MM)
2. Load MonthlyBudget for period (nullable)
3. Query invoice table for period:
   - totalInvoiced = SUM(amount) WHERE billing_period = period
   - totalCollected = SUM(amount) WHERE billing_period = period AND status = 'Paid'
   - totalOutstanding = totalInvoiced - totalCollected
   - collectionRate = (COUNT(Paid) / COUNT(*)) × 100%
4. Overdue aging: GROUP BY days overdue buckets
5. Return combined dashboard object
```

## Flow 2: Maintenance Dashboard
```
1. Query maintenance_request for date range:
   - totalOpen = COUNT WHERE status IN (Submitted, Assigned, InProgress)
   - totalClosed = COUNT WHERE status = Closed AND closed_at BETWEEN start AND end
   - avgResolutionDays = AVG(EXTRACT(EPOCH FROM (closed_at - created_at))/86400)
   - byCategory = GROUP BY category, COUNT(*)
2. Return metrics
```

## Flow 3: Engagement Dashboard
```
1. totalResidents = COUNT active ResidentProfile records
2. pollParticipation = COUNT DISTINCT user_id FROM poll_vote WHERE voted_at BETWEEN start AND end
3. eventRsvp = COUNT FROM event_rsvp WHERE status = Attending AND responded_at BETWEEN start AND end
4. announcementOpens = COUNT DISTINCT user_id FROM announcement_read WHERE read_at BETWEEN start AND end
5. Return rates as percentages
```

## Flow 4: Export Report
```
1. PM/Board requests export: reportType (financial/maintenance/engagement), period, format (pdf/csv)
2. Fetch dashboard data for the report type
3. If format = CSV:
   - Build CSV string from data rows
   - Return as application/csv with Content-Disposition: attachment
4. If format = PDF:
   - Use pdfkit to build PDF document with title, date range, data table
   - Return as application/pdf with Content-Disposition: attachment
5. Filename: hoa-{reportType}-{period}.{ext}
```
