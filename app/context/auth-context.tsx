import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "../api/authService";
import axiosClient from "../api/axiosClient";
import { setAccessToken } from "../api/tokenStore";
import type { AuthContextValue, AuthResponse } from "../types/auth";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    axiosClient
        .post<AuthResponse>("/auth/refresh")
        .then((response) => {
          setAccessToken(response.data.accessToken);
          setIsAuthenticated(true);
        })
        .catch(() => {
          setIsAuthenticated(false);
        })
        .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    await authService.login(email, password);
    setIsAuthenticated(true);
  };

  const register = async (
      email: string,
      name: string,
      phoneNumber: string,
      password: string
  ): Promise<void> => {
    await authService.register({ email, password, name, phoneNumber });
    setIsAuthenticated(true);
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return null; // swap in a spinner/splash screen if you have one
  }

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