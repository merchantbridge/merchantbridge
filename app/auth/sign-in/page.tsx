"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import AuthProviders from "@/components/auth/AuthProviders";
import { createClient } from "@/lib/supabase/client";
import { signInDestination } from "@/lib/auth/destination";
import { googleAuthEnabled, startGoogleAuth } from "@/lib/auth/google-auth";

export default function SignInPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // /auth/callback sends people here when their Google account has no
  // Merchant Bridge profile, with the reason in ?error or ?google_not_linked.
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const reason = searchParams.get("error");
    const googleNotLinked = searchParams.get("google_not_linked");
    
    if (reason) {
      setError(reason);
    } else if (googleNotLinked === "true") {
      // Show a popup notification for unlinked Google accounts
      alert(
        "Your Google account is not linked to a Merchant Bridge account yet.\n\n" +
        "To continue with Google, please:\n" +
        "1. Click 'Create an account' below\n" +
        "2. Sign up with your email first\n" +
        "3. Then you can sign in with Google on future visits"
      );
      // Clean up the URL
      window.history.replaceState({}, "", "/auth/sign-in");
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const email = String(form.get("email") || "").trim().toLowerCase();
      const password = String(form.get("password") || "");
      if (!email || !password) {
        setError("Enter your email and password.");
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        return;
      }
      if (!data.session || !data.user) {
        setError("Please confirm your email address, then sign in again.");
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      if (profileError) {
        setError(
          "You're signed in, but your workspace could not be loaded. Please try again."
        );
        return;
      }
      router.replace(
        signInDestination(
          profile?.role,
          new URLSearchParams(window.location.search).get("next") || ""
        )
      );
      router.refresh();
    } catch {
      setError("We couldn't connect. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      const next = new URLSearchParams(window.location.search).get("next") ?? "";
      await startGoogleAuth(supabase, next);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not start Google sign in. Please try again."
      );
    }
  }

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to continue your Merchant Bridge journey."
      footer={
        <>
          New to Merchant Bridge?{" "}
          <Link
            href="/auth/sign-up"
            className="font-semibold text-white underline underline-offset-4"
          >
            Create an account
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <AuthProviders
          googleEnabled={googleAuthEnabled}
          onGoogle={handleGoogle}
        />

        <form
          id="sign-in-form"
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-busy={loading}
        >
          <AuthField
            label="Email address"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
          <div>
            <AuthField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
            />
            <div className="mt-2 flex items-center justify-between px-2">
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-pressed={showPassword}
                className="py-2 text-[13px] font-semibold text-white/85 hover:text-white"
              >
                {showPassword ? "Hide password" : "Show password"}
              </button>
              <Link
                href="/auth/forgot-password"
                className="py-2 text-[13px] font-semibold text-white underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-2xl bg-white/15 p-4 text-center text-[14px] font-medium text-white"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-full bg-white px-6 py-4 text-[15px] font-bold text-slate-900 shadow-sm transition hover:bg-orange-50 disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign in with Email"}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}