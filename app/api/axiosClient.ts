import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import type { AuthResponse } from "../types/auth";
import { getAccessToken, setAccessToken } from "./tokenStore";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_DOMAIN,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

function isTokenExpired(token: string, skewSeconds = 10): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    const expiresAtMs = payload.exp * 1000;
    return Date.now() >= expiresAtMs - skewSeconds * 1000;
  } catch {
    return true;
  }
}

export async function refreshAccessToken(): Promise<string> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = axios
      .post<AuthResponse>(
          `${import.meta.env.VITE_API_DOMAIN}/auth/refresh`,
          {},
          { withCredentials: true }
      )
      .then((response) => {
        const { accessToken } = response.data;
        setAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });

  return refreshPromise;
}

axiosClient.interceptors.request.use(async (config) => {
  let accessToken = getAccessToken();

  if (accessToken && isTokenExpired(accessToken)) {
    try {
      accessToken = await refreshAccessToken();
    } catch {
      setAccessToken(null);
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const accessToken = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          setAccessToken(null);
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
);

export default axiosClient;