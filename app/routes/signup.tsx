import { Link } from "react-router";
import SignUpForm from "~/page/signup-form";

export default function Signup() {
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
                        Create your account
                    </h2>
                    <div className="mt-6">
                        <SignUpForm />
                    </div>
                </div>
                <p className="mt-6 text-center text-xs uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                    <Link to="/login" className="font-medium text-slate-900 hover:underline dark:text-slate-100">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}