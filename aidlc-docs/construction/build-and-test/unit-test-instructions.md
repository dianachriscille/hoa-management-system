# Unit Test Execution — HOA Management System

## Backend Unit Tests (Jest)

### Run All Unit Tests
```bash
cd backend
npm test
```

### Run with Coverage
```bash
cd backend
npm run test:cov
# Report: backend/coverage/lcov-report/index.html
```

### Run Specific Module
```bash
npm test -- --testPathPattern=auth
npm test -- --testPathPattern=billing
npm test -- --testPathPattern=maintenance
```

### Key Test Scenarios per Module

| Module | Key Scenarios |
|---|---|
| Auth | Registration, login, account lockout (5 attempts), token refresh, password reset, RBAC guard |
| Resident | Profile CRUD, unit uniqueness, role management, DPA deletion flow |
| Billing | Invoice generation, Maya webhook (success/failed), manual payment, overdue detection |
| Maintenance | State machine transitions (valid/invalid), notes filtering by role, analytics aggregation |
| Amenity | Availability computation, double-booking prevention (transaction), PM approve/reject |
| Security | QR HMAC signing/verification, pass expiry validation, incident report creation |
| Analytics | Financial aggregation, maintenance metrics, engagement rates, CSV/PDF export |

- **Target coverage**: 80% for service layers
- **Report location**: `backend/coverage/`

---

## Frontend Unit Tests (Vitest)

### Run All Frontend Tests
```bash
cd frontend
npm test
```

### Run with Coverage
```bash
cd frontend
npm run test:coverage
```

### Key Test Files
| File | Scenarios |
|---|---|
| `LoginPage.test.tsx` | Renders inputs, validation errors, failed login error message |
| `RegisterPage.test.tsx` | Multi-step navigation, consent required, submission |

- All API calls mocked via `vi.mock()`
- `data-testid` attributes used for element selection
