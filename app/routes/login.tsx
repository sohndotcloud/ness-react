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
        <div
            className="flex min-h-screen w-full items-center justify-center px-6"
            style={{ backgroundColor: "#FAFAF8" }}
        >
            <div className="w-full max-w-sm">
                <div className="mb-8 flex items-center justify-center gap-2">
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

                <div
                    className="rounded-lg border p-8"
                    style={{ borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }}
                >
                    <h2
                        className="text-xl font-semibold"
                        style={{ color: "#20232B", fontFamily: "'Fraunces', Georgia, serif" }}
                    >
                        Log in
                    </h2>
                    <p className="mt-1 mb-6 text-sm" style={{ color: "#6B7280" }}>
                        Enter your details to open your library.
                    </p>

                    <LoginForm/>
                </div>

                <p
                    className="mt-6 text-center text-xs uppercase tracking-[0.15em]"
                    style={{ color: "#B9BEC9", fontFamily: "ui-monospace, monospace" }}
                >
                    <Link to="/signup" className="font-medium hover:underline" style={{ color: "#20232B" }}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}