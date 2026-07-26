import { useState } from "react";
import { Form, useActionData, useNavigation, redirect } from "react-router";
import type {Route} from "../../.react-router/types/app/routes/+types/signup";

const REGISTER_ENDPOINT = "https://api.sohn.cloud/auth/register";

interface ActionData {
  error?: string;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name ||
    !email ||
    !password
  ) {
    return { error: "Fill in your name, email, and password." };
  }

  let response: Response;
  try {
    response = await fetch(REGISTER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
  } catch {
    return { error: "Couldn't reach the server. Try again." };
  }

  if (!response.ok) {
    if (response.status === 409) {
      return { error: "An account with that email already exists." };
    }
    return { error: "Something went wrong. Try again." };
  }

  const data = await response.json();
  const token = data?.token;

  if (!token) {
    return { error: "Account created but no token was returned." };
  }

  // Same SPA-mode tradeoff as login: no server to set an httpOnly cookie,
  // so the token goes in localStorage.
  localStorage.setItem("auth_token", token);

  return redirect("/");
}

export default function Signup() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [showPassword, setShowPassword] = useState(false);

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

          <Form method="post" className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "#374151" }}
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2"
                style={{ borderColor: "#D1D5DB", backgroundColor: "#FFFFFF", color: "#111827" }}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "#374151" }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2"
                style={{ borderColor: "#D1D5DB", backgroundColor: "#FFFFFF", color: "#111827" }}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium"
                  style={{ color: "#374151" }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-xs font-medium"
                  style={{ color: "#3D8B84" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2"
                style={{ borderColor: "#D1D5DB", backgroundColor: "#FFFFFF", color: "#111827" }}
              />
            </div>

            {actionData?.error && (
              <p
                role="alert"
                className="rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: "#F3C1B8", backgroundColor: "#FDF1EF", color: "#B3402F" }}
              >
                {actionData.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md py-2.5 text-sm font-semibold transition disabled:opacity-60"
              style={{ backgroundColor: "#20232B", color: "#F7F5F0" }}
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
