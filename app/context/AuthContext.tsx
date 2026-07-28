import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "../api/authService";
import type { AuthContextValue } from "../types/auth";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
      authService.isAuthenticated()
  );

  const login = async (email: string, password: string): Promise<void> => {
    await authService.login(email, password);
    setIsAuthenticated(true);
  };

  const register = async (
      email: string,
      password: string,
      timezone?: string
  ): Promise<void> => {
    await authService.register(email, password, timezone);
    setIsAuthenticated(true);
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setIsAuthenticated(false);
  };

  return (
      <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}