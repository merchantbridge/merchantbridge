"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";

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
          <Image src="/images/shopify-white.png" alt="" width={104} height={30} className="h-[22px] w-auto" priority />
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
