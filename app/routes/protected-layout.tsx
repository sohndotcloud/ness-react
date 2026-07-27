import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/protected-layout";

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const skipAuth = import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH === "true";
  if (skipAuth) {
    return null;
  }

  const token = localStorage.getItem("auth_token");

  if (!token) {
    return redirect("/login");
  }

  return null;
}

export default function ProtectedLayout() {
  return <Outlet />;
}