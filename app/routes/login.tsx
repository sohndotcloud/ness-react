import { useState } from "react";
import { Form, useActionData, useNavigation, redirect, Link } from "react-router";
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
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-200 px-6 dark:bg-slate-900 dark:bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_60%)]">
            <div className="w-full max-w-sm">
                <div className="mb-8 flex items-center justify-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 dark:bg-slate-800 ring-1 ring-cyan-400/20">
                        <span className="bg-gradient-to-b from-cyan-400 to-cyan-600 bg-clip-text text-sm font-semibold text-transparent">
                            N
                        </span>
                    </div>
                    <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        Ness
                    </span>
                </div>

                <div className="rounded-lg border border-slate-300 bg-white p-8 dark:border-slate-700 dark:bg-slate-800/60 dark:backdrop-blur">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                        Log in
                    </h2>

                    {actionData?.error && (
                        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                            {actionData.error}
                        </div>
                    )}

                    <LoginForm />
                </div>

                <p className="mt-6 text-center text-xs uppercase tracking-[0.15em] font-mono text-slate-400 dark:text-slate-500">
                    <Link
                        to="/signup"
                        className="font-medium text-slate-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 dark:text-slate-200"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}