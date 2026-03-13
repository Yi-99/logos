export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  accessToken?: string;
	lastLoginAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loginTime: Date | null;
  sessionDuration: number; // in minutes
  data?: any | null;
}
