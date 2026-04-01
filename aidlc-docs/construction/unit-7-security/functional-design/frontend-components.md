# Frontend Components — Unit 7: Security & Access Control

## Resident View (`src/features/security/`)
```
VisitorPassPage
├── CreatePassButton → CreatePassModal
│   ├── VisitorNameInput
│   ├── ValidDatePicker
│   └── CreateButton
├── ActivePassList
│   └── PassCard
│       ├── VisitorName + ValidDate
│       ├── QRCodeImage (base64 PNG)
│       └── RevokeButton
└── ExpiredPassList (collapsed)

IncidentReportPage (Resident)
├── NewIncidentButton → NewIncidentModal
│   ├── CategorySelect
│   ├── DescriptionTextarea
│   ├── LocationInput
│   ├── DatePicker + TimePicker
│   ├── PhotoUpload (S3 pre-signed URL)
│   └── SubmitButton
└── MyIncidentList
    └── IncidentCard (reportNumber, category, status, date)
```

## Gate Guard View (`src/features/security/gate-guard/`)
```
GateGuardDashboard (touch-optimized, large targets)
├── TodayVisitorList
│   └── VisitorRow (visitorName, unitNumber)
├── VerifyPassSection
│   ├── QRScanButton (opens camera)
│   ├── ManualPassCodeInput
│   └── VerifyButton → VerificationResult
│       ├── ValidBadge (green) or InvalidBadge (red)
│       └── PassDetails (visitorName, unit, date)
├── ResidentLookupSection
│   ├── UnitNumberInput
│   └── LookupButton → ResidentCard
│       ├── ProfilePhoto
│       └── ResidentName + UnitNumber
└── ReportIncidentButton → NewIncidentModal
```

## API Integration Points
| Component | Endpoint | Method |
|---|---|---|
| CreatePassModal | `/security/visitor-passes` | POST |
| ActivePassList | `/security/visitor-passes/me` | GET |
| RevokeButton | `/security/visitor-passes/:id/revoke` | POST |
| VerifyPassSection | `/security/visitor-passes/verify?code=` | GET |
| TodayVisitorList | `/security/visitor-passes/today` | GET |
| ResidentLookupSection | `/security/residents/lookup?unit=` | GET |
| NewIncidentModal | `/security/incidents` | POST |
| MyIncidentList | `/security/incidents/me` | GET |
| IncidentDashboard (PM/Board) | `/security/incidents` | GET |
