import SignUpForm from "~/page/signup-form";

export default function Signup() {
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
                        Create your account
                    </h2>

                    <SignUpForm />
                </div>
            </div>
        </div>
    );
}