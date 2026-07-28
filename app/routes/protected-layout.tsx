import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/protected-layout";
import { authService } from "~/api/authService";
import { getAccessToken } from "~/api/tokenStore";
import axiosClient from "~/api/axiosClient";

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const skipAuth = import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH === "true";
  if (skipAuth) {
    return null;
  }

  if (authService.isAuthenticated()) {
    return null;
  }

  try {
    await axiosClient.post("/auth/refresh", {}, { withCredentials: true });
    return null;
  } catch {
    return redirect("/login");
  }
}

export default function ProtectedLayout() {
  return <Outlet />;
}