import { useState } from "react";
import type { FormEvent } from "react";
import {Link, useNavigate} from "react-router";
import { useAuth } from "../context/auth-context";
import axios from "axios";

interface ApiErrorResponse {
    message: string;
    timestamp: string;
}

function SignUpForm() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await register(email, password);
            navigate("/");
        } catch (err) {
            let message = "An unexpected error occurred.";

            if (axios.isAxiosError(err)) {
                const data = err.response?.data as { message?: string } | undefined;
                message = data?.message ?? err.message;
            } else if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === "string") {
                message = err;
            }

            setError(message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                    style={{ color: "#6B7280" }}
                >
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded-md border px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{
                        borderColor: "#D8D3C7",
                        backgroundColor: "#FAFAF8",
                        color: "#20232B",
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#20232B";
                        e.currentTarget.style.backgroundColor = "#FFFFFF";
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#D8D3C7";
                        e.currentTarget.style.backgroundColor = "#FAFAF8";
                    }}
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                    style={{ color: "#6B7280" }}
                >
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-md border px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{
                        borderColor: "#D8D3C7",
                        backgroundColor: "#FAFAF8",
                        color: "#20232B",
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#20232B";
                        e.currentTarget.style.backgroundColor = "#FFFFFF";
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#D8D3C7";
                        e.currentTarget.style.backgroundColor = "#FAFAF8";
                    }}
                />
            </div>

            {error && (
                <p className="text-sm" style={{ color: "#B91C1C" }}>
                    {error}
                </p>
            )}

            <button
                type="submit"
                className="mt-2 rounded-md px-3 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#20232B", color: "#FFFFFF" }}
            >
                Create account
            </button>

            <p className="mt-2 text-center text-sm" style={{ color: "#6B7280" }}>
                Already have an account?{" "}
                <Link
                to="/login"
                className="font-medium hover:underline"
                >
                Log in
            </Link>
        </p>
</form>
);
}

export default SignUpForm;