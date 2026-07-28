import { useState } from "react";
import { Form, useActionData, useNavigation, redirect } from "react-router";
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
            credentials: "include", // required to accept the HttpOnly refresh cookie
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

    localStorage.setItem("auth_token", token);

    return redirect("/");
}

export default function Login() {
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex min-h-screen w-full" style={{ backgroundColor: "#FAFAF8" }}>
            {/* Left rail — mirrors the app's sidebar */}
            <div
                className="hidden w-64 flex-col justify-between border-r px-6 py-8 md:flex"
                style={{ borderColor: "#E5E1D8" }}
            >
                <div>
                    <div className="flex items-center gap-2">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-md"
                            style={{ backgroundColor: "#20232B" }}
                        >
                            <span className="text-sm font-semibold" style={{ color: "#F2C14E" }}>
                                N
                            </span>
                        </div>
                        <span
                            className="text-lg font-semibold"
                            style={{ color: "#20232B", fontFamily: "'Fraunces', Georgia, serif" }}
                        >
                            Ness
                        </span>
                    </div>

                    <p
                        className="mt-10 text-xs font-medium uppercase tracking-[0.2em]"
                        style={{ color: "#9CA3AF", fontFamily: "ui-monospace, monospace" }}
                    >
                        Your library
                    </p>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: "#6B7280" }}>
                        Every PDF, one shelf, no distractions. Pick up exactly where the
                        margin note left off.
                    </p>
                </div>

                <p
                    className="text-xs uppercase tracking-[0.2em]"
                    style={{ color: "#B9BEC9", fontFamily: "ui-monospace, monospace" }}
                >
                    v1.0
                </p>
            </div>

            {/* Main panel — card-based, matches dashboard content area */}
            <div className="flex flex-1 items-center justify-center px-6 py-16">
                <div className="w-full max-w-sm">
                    <p
                        className="mb-2 text-xs font-medium uppercase tracking-[0.2em]"
                        style={{ color: "#9CA3AF", fontFamily: "ui-monospace, monospace" }}
                    >
                        Sign in
                    </p>
                    <h2
                        className="text-2xl font-semibold"
                        style={{ color: "#20232B", fontFamily: "'Fraunces', Georgia, serif" }}
                    >
                        Log in
                    </h2>
                    <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
                        Enter your details to open your library.
                    </p>

                    <div
                        className="mt-8 rounded-lg border p-6"
                        style={{ borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }}
                    >
                        <LoginForm/>
                    </div>

                    <p
                        className="mt-6 text-center text-xs uppercase tracking-[0.15em]"
                        style={{ color: "#B9BEC9", fontFamily: "ui-monospace, monospace" }}
                    >
                        Ness · secure sign in
                    </p>
                </div>
            </div>
        </div>
    );
}