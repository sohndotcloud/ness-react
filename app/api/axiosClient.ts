import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import type { AuthResponse } from "../types/auth";
import { getAccessToken, setAccessToken } from "./tokenStore";


interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_DOMAIN,
  withCredentials: true, // sends the HttpOnly refresh cookie automatically
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            pendingRequests.push({ resolve, reject });
          }).then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await axios.post<AuthResponse>(
              `${import.meta.env.VITE_API_DOMAIN}/auth/refresh`,
              {},
              { withCredentials: true }
          );

          const { accessToken } = response.data;
          setAccessToken(accessToken);

          pendingRequests.forEach((req) => req.resolve(accessToken));
          pendingRequests = [];

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          pendingRequests.forEach((req) => req.reject(refreshError));
          pendingRequests = [];

          setAccessToken(null);
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
);

export default axiosClient;