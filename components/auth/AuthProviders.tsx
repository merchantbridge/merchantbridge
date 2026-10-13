"use client";

import Image from "next/image";
import { useState } from "react";
import { shopifyInstallUrl, startShopifyAuth } from "@/lib/auth/shopify-domain";

export const pillButtonClass =
  "flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-4 text-[15px] font-bold text-slate-900 shadow-sm transition hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:pointer-events-none";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export function EnvelopeIcon({ className = "h-6 w-6 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="m3 7.5 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AuthProviders({
  googleEnabled,
  onGoogle,
}: {
  googleEnabled: boolean;
  onGoogle?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const canInstallDirectly = Boolean(shopifyInstallUrl);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => {
          if (canInstallDirectly) {
            window.location.href = shopifyInstallUrl;
            return;
          }
          setOpen((value) => !value);
        }}
        aria-expanded={canInstallDirectly ? undefined : open}
        className={pillButtonClass}
      >
        <Image
          src="/images/shopify.png"
          alt=""
          width={104}
          height={30}
          className="h-[22px] w-auto"
        />
        Continue with Shopify
      </button>

      {open && (
        <div className="rounded-3xl bg-white/10 p-4 text-left">
          <label
            htmlFor="shopify-domain"
            className="mb-2 block text-[13px] font-semibold text-white"
          >
            Your Shopify store
          </label>
          <div className="flex gap-2">
            <input
              id="shopify-domain"
              type="text"
              inputMode="url"
              autoComplete="url"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  startShopifyAuth(domain);
                }
              }}
              placeholder="your-store"
              className="min-w-0 flex-1 rounded-full bg-white px-5 py-3 text-[15px] text-slate-950 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-white/30"
            />
            <span className="hidden items-center rounded-full bg-white/15 px-4 text-sm text-white sm:flex">
              .myshopify.com
            </span>
          </div>
          <button
            type="button"
            disabled={!domain.trim()}
            onClick={() => startShopifyAuth(domain)}
            className={`${pillButtonClass} mt-3`}
          >
            Connect store
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={googleEnabled ? onGoogle : undefined}
        aria-disabled={!googleEnabled}
        className={`${pillButtonClass} ${googleEnabled ? "" : "cursor-not-allowed bg-white/85 text-slate-500 hover:bg-white/85"}`}
      >
        <GoogleIcon />
        <span>Continue with Google</span>
        {!googleEnabled && (
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accentDeep">
            Soon
          </span>
        )}
      </button>
    </div>
  );
}