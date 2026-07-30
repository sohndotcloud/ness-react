import { useState } from "react";
import {Form, useActionData, useNavigation, redirect, Link} from "react-router";
import type { Route } from "./+types/login";
import LoginForm from "~/page/login-form";
const AUTH_ENDPOINT = "/auth/login";
interface ActionData {
    error?: string;
}
export async function clientAction({ request }: Route.ClientActionArgs) {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
        return { error: "Enter your email and password." };
    }
    let response: Response;
    try {
        response = await fetch(import.meta.env.VITE_API_DOMAIN + AUTH_ENDPOINT, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
    } catch {
        return { error: "Couldn't reach the server. Try again." };
    }
    if (!response.ok) {
        if (response.status === 401) {
            return { error: "Incorrect email or password." };
        }
        return { error: "Something went wrong. Try again." };
    }
    const data = await response.json();
    const token = data?.accessToken;
    if (!token) {
        return { error: "Service is down." };
    }
    return redirect("/");
}
export default function Login() {
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-200 px-6 dark:bg-slate-900">
            <div
                className="pointer-events-none absolute inset-0 dark:bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.06),_transparent_60%)]"
                aria-hidden="true"
            />
            <div className="relative w-full max-w-sm">
                <div className="mb-8 flex items-center justify-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 dark:bg-cyan-400/10 dark:ring-1 dark:ring-cyan-400/40">
                        <span className="text-sm font-semibold text-cyan-400">N</span>
                    </div>
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Ness
                    </span>
                </div>
                <div className="rounded-lg border border-slate-300 bg-white p-8 dark:border-slate-700 dark:bg-slate-800">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Log in
                    </h2>
                    <div className="mt-6">
                        <LoginForm/>
                    </div>
                </div>
                <p className="mt-6 text-center text-xs uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                    <Link to="/signup" className="font-medium text-slate-900 hover:underline dark:text-slate-100">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}