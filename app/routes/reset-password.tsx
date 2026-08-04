import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { confirmPasswordReset } from "~/api/authService";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirm) {
            setStatus("error");
            setErrorMsg("Passwords don't match.");
            return;
        }

        setStatus("loading");
        try {
            await confirmPasswordReset(token, password);
            setStatus("done");
            setTimeout(() => navigate("/login"), 2000);
        } catch {
            setStatus("error");
            setErrorMsg("This link may have expired. Request a new one.");
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-200 dark:bg-slate-900 px-4">
                <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center">
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                        Missing or invalid reset link.
                    </p>
                    <Link to="/forgot-password" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                        Request a new one
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-200 dark:bg-slate-900 dark:bg-[radial-gradient(circle_at_top,_theme(colors.cyan.900),_transparent_60%)] px-4">
            <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8">
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                    Set a new password
                </h1>

                {status === "done" ? (
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        Password updated. Redirecting to login...
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                                New password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                                Confirm password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                        </div>

                        {status === "error" && (
                            <p className="text-sm text-red-500">{errorMsg}</p>
                        )}

                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white text-sm font-medium py-2 transition-colors"
                        >
                            {status === "loading" ? "Updating..." : "Update password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}