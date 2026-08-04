import axiosClient from "./axiosClient";
import type { AuthResponse } from "../types/auth";
import { getAccessToken, setAccessToken } from "./tokenStore";

export const authService = {
  async register(email: string, password: string, timezone?: string): Promise<void> {
    const response = await axiosClient.post<AuthResponse>("/auth/register", {
      email,
      password,
      timezone,
    });
    setAccessToken(response.data.accessToken);
  },

  async login(email: string, password: string): Promise<void> {
    const response = await axiosClient.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    setAccessToken(response.data.accessToken);
  },

  async logout(): Promise<void> {
    try {
      await axiosClient.post("/auth/logout");
    } finally {
      setAccessToken(null);
    }
  },

  isAuthenticated(): boolean {
    return !!getAccessToken();
  },
};

export async function requestPasswordReset(email: string): Promise<void> {
  await axiosClient.post("/auth/password-reset/request", { email });
}

export async function confirmPasswordReset(
    token: string,
    newPassword: string
): Promise<void> {
  await axiosClient.post("/auth/password-reset/confirm", { token, newPassword });
}