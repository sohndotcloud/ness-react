import SignUpForm from "~/page/signup-form";

export default function Signup() {
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
                        Create your account
                    </h2>
                    <p className="mt-1 mb-6 text-sm" style={{ color: "#6B7280" }}>
                        Takes a minute. No card required.
                    </p>

                    <SignUpForm />
                </div>

                <p
                    className="mt-6 text-center text-xs uppercase tracking-[0.15em]"
                    style={{ color: "#B9BEC9", fontFamily: "ui-monospace, monospace" }}
                >
                    Ness · secure sign in
                </p>
            </div>
        </div>
    );
}