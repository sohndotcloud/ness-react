import axiosClient from "./axiosClient";
import type { AuthResponse } from "../types/auth";

export const authService = {
  async register(
      email: string,
      password: string,
      timezone?: string
  ): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>("/auth/register", {
      email,
      password,
      timezone,
    });
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    return response.data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      await axiosClient.post("/auth/logout", { refreshToken });
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  },
};