export interface AuthResponse {
  accessToken: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  timezone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phoneNumber: string, timezone?: string) => Promise<void>;
  logout: () => Promise<void>;
}