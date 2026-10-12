"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import { createClient } from "@/lib/supabase/client";
import { signInDestination } from "@/lib/auth/destination";

export default function SignInPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shopDomain, setShopDomain] = useState("");

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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
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
        setError("You're signed in, but your workspace could not be loaded. Please try again.");
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

  function handleShopifyAuth() {
    const domain = shopDomain.trim().toLowerCase().replace(/^https:\/\//, "").replace(/\.myshopify\.com$/, "") + ".myshopify.com";
    window.location.href = `/api/shopify/auth?shop=${encodeURIComponent(domain)}`;
  }

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to continue your Merchant Bridge journey."
      footer={
        <>
          New to Merchant Bridge?{" "}
          <Link href="/auth/sign-up" className="font-semibold text-blue-700 underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="shopify-domain" className="mb-2 block text-sm font-medium text-slate-700">
            Your Shopify store
          </label>
          <div className="flex gap-2">
            <input
              id="shopify-domain"
              type="text"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              placeholder="your-store"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
            <span className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">
              .myshopify.com
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleShopifyAuth}
          disabled={!shopDomain.trim()}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#95BF47] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#7BA434] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 2.5c-.3 0-.6.1-.8.4-.2.2-.3.5-.3.8v.3c-.8.2-1.6.5-2.3.9-.7-1.2-1.6-1.9-2.6-1.9h-.1c-.4-.5-1-.8-1.7-.8-.6 0-1.1.3-1.5.7-.4.4-.7.9-.8 1.5-.1.6 0 1.2.3 1.7l.9.2c.9.2 1.9.5 2.9.8-.9.8-1.7 1.9-2 3.2-.3 1.3-.2 2.6.3 3.8.5 1.2 1.3 2.2 2.4 2.9 1.1.7 2.3 1 3.6.8 1.3-.2 2.5-.8 3.5-1.7.9-.9 1.6-2 2-3.2.4-1.2.5-2.5.2-3.7-.3-1.2-1-2.3-2-3.2-.3-.2-.6-.3-.9-.3-1-.1-2 .2-2.9.8-.7-.4-1.4-.7-2.1-.9-.1-.3-.2-.6-.2-.9 0-.3.1-.6.3-.8.2-.2.4-.4.6-.5-.3-.1-.6-.1-.9-.1z"/>
          </svg>
          Continue with Shopify
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-500">or sign in with email</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
          <AuthField label="Email address" name="email" type="email" required autoComplete="email" />
          <div>
            <AuthField label="Password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" />
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-pressed={showPassword}
                className="py-2 text-xs font-medium text-slate-600"
              >
                {showPassword ? "Hide password" : "Show password"}
              </button>
              <Link href="/auth/forgot-password" className="py-2 text-xs font-semibold text-blue-700">
                Forgot password?
              </Link>
            </div>
          </div>
          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
