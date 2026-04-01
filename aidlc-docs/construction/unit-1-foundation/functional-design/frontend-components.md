# Frontend Components — Unit 1: Foundation

## Feature: auth (`src/features/auth/`)

### Component Hierarchy

```
AuthLayout
├── LoginPage
│   ├── LoginForm
│   │   ├── EmailInput
│   │   ├── PasswordInput
│   │   └── SubmitButton
│   └── ForgotPasswordLink
├── RegisterPage
│   ├── RegisterForm
│   │   ├── PersonalInfoStep
│   │   │   ├── FirstNameInput
│   │   │   ├── LastNameInput
│   │   │   ├── UnitNumberInput
│   │   │   └── ContactNumberInput
│   │   ├── AccountStep
│   │   │   ├── EmailInput
│   │   │   └── PasswordInput (with strength indicator)
│   │   ├── OptionalInfoStep
│   │   │   ├── VehiclePlate1Input
│   │   │   ├── VehiclePlate2Input
│   │   │   ├── EmergencyContactNameInput
│   │   │   └── EmergencyContactNumberInput
│   │   └── ConsentStep
│   │       ├── ConsentText (DPA 2012 disclosure)
│   │       └── ConsentCheckbox (required)
├── EmailVerificationPage
│   └── VerificationStatusMessage
├── ForgotPasswordPage
│   └── ForgotPasswordForm
│       └── EmailInput
└── ResetPasswordPage
    └── ResetPasswordForm
        ├── NewPasswordInput
        └── ConfirmPasswordInput
```

### State Management

| Component | State | Description |
|---|---|---|
| LoginForm | `{ email, password, isLoading, error }` | Form state + submission state |
| RegisterForm | `{ step (1-4), formData, isLoading, error }` | Multi-step form state |
| AuthContext | `{ user, accessToken, isAuthenticated, isLoading }` | Global auth state (React Context) |

### API Integration Points

| Component | Endpoint | Method |
|---|---|---|
| LoginForm | `/auth/login` | POST |
| RegisterForm | `/auth/register` | POST |
| EmailVerificationPage | `/auth/verify-email?token=` | GET |
| ForgotPasswordForm | `/auth/forgot-password` | POST |
| ResetPasswordForm | `/auth/reset-password` | POST |
| AuthContext (token refresh) | `/auth/refresh` | POST |

### Form Validation Rules (client-side)

| Field | Rule |
|---|---|
| email | Required, valid email format |
| password (register) | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |
| password (login) | Required, non-empty |
| unitNumber | Required, alphanumeric, max 20 chars |
| contactNumber | Required, valid PH mobile format (+63XXXXXXXXXX or 09XXXXXXXXX) |
| consentCheckbox | Must be checked to proceed |

### Route Guards
- Unauthenticated users redirected to `/login` for protected routes
- Authenticated users redirected to `/dashboard` if accessing `/login` or `/register`

---

## Feature: resident (`src/features/resident/`)

### Component Hierarchy

```
ResidentLayout
├── ProfilePage (Resident)
│   ├── ProfileHeader
│   │   ├── ProfilePhoto (with upload button)
│   │   └── ProfileName + UnitNumber
│   └── ProfileForm
│       ├── ContactNumberInput
│       ├── VehiclePlatesSection
│       │   ├── VehiclePlate1Input
│       │   └── VehiclePlate2Input
│       ├── EmergencyContactSection
│       │   ├── EmergencyContactNameInput
│       │   └── EmergencyContactNumberInput
│       └── SaveButton
├── DirectoryPage (Property Manager only)
│   ├── DirectorySearchBar
│   ├── DirectoryTable
│   │   └── DirectoryRow (per resident)
│   └── DirectoryPagination
├── ResidentDetailPage (Property Manager only)
│   ├── ResidentProfileCard
│   └── RoleManagementSection
│       ├── CurrentRoleBadge
│       └── ChangeRoleDropdown + SaveButton
└── DataPrivacyPage (Resident)
    ├── ConsentHistoryList
    └── DataRequestSection
        ├── RequestAccessButton
        ├── RequestCorrectionButton
        └── RequestDeletionButton (with confirmation modal)
```

### State Management

| Component | State | Description |
|---|---|---|
| ProfileForm | `{ formData, isDirty, isLoading, error, successMessage }` | Profile edit state |
| ProfilePhoto | `{ previewUrl, isUploading, uploadProgress }` | S3 upload state |
| DirectoryPage | `{ residents[], searchQuery, page, totalCount, isLoading }` | Directory list state |
| DataPrivacyPage | `{ requests[], isSubmitting }` | DPA request state |

### API Integration Points

| Component | Endpoint | Method |
|---|---|---|
| ProfileForm | `/residents/me` | GET, PATCH |
| ProfilePhoto | `/files/presigned-url` | POST (get S3 URL) |
| DirectoryPage | `/residents?search=&page=` | GET |
| ResidentDetailPage | `/residents/:id` | GET |
| ChangeRoleDropdown | `/residents/:id/role` | PATCH |
| DataPrivacyPage | `/residents/me/data-requests` | GET, POST |

### Role-Based Rendering

| Component | Visible To |
|---|---|
| DirectoryPage | PropertyManager only |
| ResidentDetailPage | PropertyManager only |
| RoleManagementSection | PropertyManager only |
| DataPrivacyPage | Resident only |
| ProfilePage | All roles (own profile) |

### User Interaction Flows

**Profile Photo Upload**:
1. User clicks profile photo → file picker opens
2. Client validates file type (JPG/PNG) and size (≤ 5MB)
3. POST `/files/presigned-url` → receive S3 pre-signed URL
4. PUT file directly to S3 using pre-signed URL
5. On S3 success → PATCH `/residents/me` with new S3 key
6. Profile photo updates in UI

**Data Deletion Request**:
1. Resident clicks "Request Data Deletion"
2. Confirmation modal: "This will permanently delete your account and personal data after 1 year. Are you sure?"
3. On confirm → POST `/residents/me/data-requests` with type = Deletion
4. Success message: "Your deletion request has been submitted. The property manager will review it."
