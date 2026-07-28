import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

function LoginForm() {
    const { login, isAuthenticated } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            // no navigate() here — the effect above fires once
            // isAuthenticated actually flips to true
        } catch (err) {
            console.error("login failed:", err);
            setError(err instanceof Error ? err.message : "Login failed");
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
                    placeholder="you@example.com"
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
                Log in
            </button>
        </form>
    );
}

export default LoginForm;