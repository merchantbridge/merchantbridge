"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";

function ShopifyMark() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15.5 2.5c-.3 0-.6.1-.8.4-.2.2-.3.5-.3.8v.3c-.8.2-1.6.5-2.3.9-.7-1.2-1.6-1.9-2.6-1.9h-.1c-.4-.5-1-.8-1.7-.8-.6 0-1.1.3-1.5.7-.4.4-.7.9-.8 1.5-.1.6 0 1.2.3 1.7l.9.2c.9.2 1.9.5 2.9.8-.9.8-1.7 1.9-2 3.2-.3 1.3-.2 2.6.3 3.8.5 1.2 1.3 2.2 2.4 2.9 1.1.7 2.3 1 3.6.8 1.3-.2 2.5-.8 3.5-1.7.9-.9 1.6-2 2-3.2.4-1.2.5-2.5.2-3.7-.3-1.2-1-2.3-2-3.2-.3-.2-.6-.3-.9-.3-1-.1-2 .2-2.9.8-.7-.4-1.4-.7-2.1-.9-.1-.3-.2-.6-.2-.9 0-.3.1-.6.3-.8.2-.2.4-.4.6-.5-.3-.1-.6-.1-.9-.1z" />
    </svg>
  );
}

export default function JoinPage() {
  const [shopDomain, setShopDomain] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  function handleShopifyAuth() {
    const domain = shopDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "").replace(/\.myshopify\.com$/, "");
    if (!domain) return;
    window.location.href = `/api/shopify/auth?shop=${encodeURIComponent(`${domain}.myshopify.com`)}`;
  }

  function handleEmailContinue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return;
    router.push(`/auth/sign-up?email=${encodeURIComponent(value)}`);
  }

  return (
    <AuthShell
      title="Connect your store"
      subtitle="Merchant Bridge is for merchants. Connect Shopify and we'll build your profile from your real products."
      footer={
        <>
          Already part of Merchant Bridge?{" "}
          <Link href="/auth/sign-in" className="font-semibold text-accentDim underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="shop-domain" className="mb-2 block text-sm font-medium text-slate-700">
            Your Shopify store
          </label>
          <div className="flex gap-2">
            <input
              id="shop-domain"
              type="text"
              inputMode="url"
              autoComplete="url"
              value={shopDomain}
              onChange={(event) => setShopDomain(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleShopifyAuth();
                }
              }}
              placeholder="your-store"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-accentDim"
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
          <ShopifyMark />
          Continue with Shopify
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-500">or use email</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleEmailContinue} className="space-y-3">
          <label htmlFor="join-email" className="sr-only">
            Email address
          </label>
          <input
            id="join-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@yourstore.com"
            className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-accentDim"
          />
          <button
            type="submit"
            disabled={!email.trim()}
            className="w-full rounded-xl bg-accentDim px-6 py-4 text-sm font-bold text-white transition hover:bg-accentDeep disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            Continue with email
          </button>
        </form>

        <p className="text-xs leading-5 text-slate-500">
          Not on Shopify?{" "}
          <Link href="/merchant/apply" className="font-semibold text-accentDim underline underline-offset-4">
            Apply for access
          </Link>{" "}
          and add your store details by hand. Buyer accounts are set up by our team —{" "}
          <Link href="/buyers/apply" className="font-semibold text-accentDim underline underline-offset-4">
            request buyer access
          </Link>
          .
        </p>
      </div>
    </AuthShell>
  );
}
