import SignUpForm from "~/page/signup-form";

export default function Signup() {
  return (
      <div className="flex min-h-screen w-full flex-col md:flex-row">
        {/* Branding panel */}
        <div
            className="relative flex w-full items-center justify-center overflow-hidden px-8 py-16 md:w-1/2 md:py-0"
            style={{ backgroundColor: "#20232B" }}
        >
          <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                    "repeating-linear-gradient(to bottom, transparent, transparent 35px, #F7F5F0 35px, #F7F5F0 36px)",
              }}
          />
          <div
              className="pointer-events-none absolute left-16 top-0 hidden h-full w-px md:block"
              style={{ backgroundColor: "#D96C4F", opacity: 0.35 }}
          />
          <div className="relative z-10 max-w-sm">
            <p
                className="mb-3 text-xs font-medium uppercase tracking-[0.25em]"
                style={{ color: "#F2C14E" }}
            >
              Start your shelf
            </p>
            <h1
                className="text-4xl font-semibold leading-tight md:text-5xl"
                style={{ color: "#F7F5F0", fontFamily: "'Fraunces', Georgia, serif" }}
            >
              notebook
              <span style={{ color: "#F2C14E" }}>.</span>
              focus
            </h1>
            <p className="mt-5 text-base leading-relaxed" style={{ color: "#B9BEC9" }}>
              One place for every PDF you're reading, with the margin notes
              attached — no more digging through downloads.
            </p>
          </div>
        </div>
        {/* Form panel */}
        <div
            className="flex w-full items-center justify-center px-6 py-16 md:w-1/2"
            style={{ backgroundColor: "#FAFAF8" }}
        >
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-semibold" style={{ color: "#20232B" }}>
              Create your account
            </h2>
            <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
              Takes a minute. No card required.
            </p>
            <SignUpForm />
          </div>
        </div>
      </div>
  );
}