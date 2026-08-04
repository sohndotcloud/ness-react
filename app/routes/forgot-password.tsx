import { useState } from "react";
import { Link } from "react-router";
import { requestPasswordReset } from "~/api/authService";
import { useTheme } from "~/context/theme-context";

export default function ForgotPassword() {
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await requestPasswordReset(email);
      setStatus("sent"); // always show success, even if email doesn't exist
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 dark:bg-slate-900 dark:bg-[radial-gradient(circle_at_top,_theme(colors.cyan.900),_transparent_60%)] px-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Reset your password
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Enter your email and we'll send you a reset link.
        </p>

        {status === "sent" ? (
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <p>If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way.</p>
            <Link
              to="/login"
              className="mt-4 inline-block text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="you@example.com"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-500">
                Something went wrong. Try again in a moment.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white text-sm font-medium py-2 transition-colors"
            >
              {status === "loading" ? "Sending..." : "Send reset link"}
            </button>

            <Link
              to="/login"
              className="block text-center text-sm text-slate-500 dark:text-slate-400 hover:underline"
            >
              Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}