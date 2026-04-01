# Business Logic Model — Unit 7: Security & Access Control

## Flow 1: Create Visitor Pass
```
1. Resident submits: visitorName, validDate
2. Validate: validDate >= today
3. Generate passCode: 8-char alphanumeric (nanoid or crypto.randomBytes)
4. Create VisitorPass record
5. Generate QR code (qrcode library): encode JSON { passCode, visitorName, validDate, unitNumber }
6. Return pass with QR code as base64 PNG data URL
```

## Flow 2: Verify Visitor Pass (Gate Guard)
```
1. Gate guard scans QR or enters passCode manually
2. Decode QR payload → extract passCode
3. Look up VisitorPass by passCode
4. Validate:
   - If not found → INVALID: "Pass not found"
   - If isRevoked → INVALID: "Pass has been revoked"
   - If validDate < today → INVALID: "Pass has expired"
   - If validDate > today → INVALID: "Pass is not yet valid"
5. If valid → return VALID with: visitorName, unitNumber, validDate
```

## Flow 3: Resident Identity Verification (Gate Guard)
```
1. Gate guard searches by unit number
2. Look up ResidentProfile by unitNumber
3. Return: firstName, lastName, unitNumber, profilePhotoPresignedUrl
4. If not found → "No resident found for this unit"
```

## Flow 4: Submit Incident Report
```
1. User submits: category, description, location?, incidentDate, incidentTime?, photoKey?
2. Generate report number: INC-{YYYY}-{seq}
3. Create IncidentReport (status = Open)
4. Notify Board Members + PM via push: "New incident report #{reportNumber}"
5. Log AuditLog: action = INCIDENT_REPORT_SUBMITTED
6. Return created report
```

## Flow 5: Today's Visitor List (Gate Guard)
```
1. Gate guard opens interface
2. Query VisitorPass where validDate = today AND isRevoked = false
3. Return list with: visitorName, unitNumber, passCode
```
