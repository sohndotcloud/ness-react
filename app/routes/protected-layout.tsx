import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/protected-layout";

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    return redirect("/login");
  }

  return null;
}

export default function ProtectedLayout() {
  return <Outlet />;
}
