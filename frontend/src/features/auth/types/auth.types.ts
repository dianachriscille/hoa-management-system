export interface User {
  userId: string;
  email: string;
  role: 'Resident' | 'BoardMember' | 'PropertyManager' | 'GateGuard';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest { email: string; password: string; }

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  unitNumber: string;
  contactNumber: string;
  consentGiven: boolean;
}
