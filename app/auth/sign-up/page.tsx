"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import { createClient } from "@/lib/supabase/client";

function SignUpForm() {
  const [shopDomain, setShopDomain] = useState("");
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email") || "";

  function handleShopifyAuth() {
    const domain = shopDomain.trim().toLowerCase().replace(/^https:\/\//, "").replace(/\.myshopify\.com$/, "") + ".myshopify.com";
    window.location.href = `/api/shopify/auth?shop=${encodeURIComponent(domain)}`;
  }
  const supabase = createClient();
  const router = useRouter();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const form = new FormData(event.currentTarget);

    const fullName = String(
      form.get("fullName") || ""
    ).trim();

    const businessName = String(
      form.get("businessName") || ""
    ).trim();

    const email = String(
      form.get("email") || ""
    ).trim().toLowerCase();

    const password = String(
      form.get("password") || ""
    );

    if (!fullName || !businessName || !email || !password) {
      setLoading(false);
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setLoading(false);
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              account_type: "merchant",
              full_name: fullName,
              business_name: businessName,
            },
          },
        });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (!data.user) {
        setError(
          "Merchant Bridge could not create your account. Please try again."
        );
        return;
      }

      /*
       * Supabase may return:
       * - a user + session when email confirmation is disabled
       * - a user + no session when email confirmation is required
       */

      if (data.session) {
        router.replace("/merchant/setup");
        router.refresh();
        return;
      }

      setMessage(
        "Your account was created. Check your email for the confirmation code."
      );

      router.replace(
        `/auth/verify?email=${encodeURIComponent(email)}&next=/merchant/setup`
      );
    } catch (err) {
      console.error("Merchant Bridge signup error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Apply as a merchant"
      subtitle="Create your brand workspace, complete your profile, and start submitting product listings for review."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="text-accent"
          >
            Sign in
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
          <span className="text-xs font-medium text-slate-500">or sign up with email</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <p className="text-sm text-slate-600">Merchant / supplier account. <Link href="/buyers/apply" className="text-blue-700 underline">Buying or sourcing gifts? Request buyer access.</Link></p>
        <AuthField
          label="Full Name"
          name="fullName"
          required
          autoComplete="name"
        />

        <AuthField
          label="Business Name"
          name="businessName"
          required
          autoComplete="organization"
        />

        <AuthField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={prefilledEmail}
        />

        <AuthField
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading
            ? "Creating account..."
            : "Create Account"}
        </button>

        <p className="text-center text-xs leading-5 text-slate-400">
          By creating an account, you agree to Merchant Bridge&apos;s
          terms and privacy policy.
        </p>
      </form>
    </AuthShell>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
