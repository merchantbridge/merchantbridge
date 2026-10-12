"use client";

import AuthControls from "@/components/shared/AuthControls";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/about", label: "What We Do" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/blog", label: "Journal" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isCommunity = pathname === "/community" || pathname === "/merchantbridge" || (typeof window !== "undefined" && window.location.hostname === "community.demerchantbridge.com");

  if (isCommunity) return null;

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-4 sm:top-4">
      <nav className="mx-auto flex max-w-[1180px] items-center justify-between rounded-full border border-white/80 bg-white/90 py-2 pl-4 pr-2 shadow-[0_10px_35px_rgba(15,23,42,.10)] backdrop-blur-xl sm:pl-5 sm:pr-2.5">
        <Link href="/" className="flex shrink-0 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-horizontal.png" alt="Merchant Bridge" className="theme-logo h-7 w-auto object-contain sm:h-8" />
        </Link>

        <ul className="hidden items-center gap-7 text-[14.5px] text-textSecondary md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-accentDim">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-1.5 md:flex">
          <AuthControls />
          <Link
            href="/auth/join"
            className="rounded-full px-4 py-2 text-[13.5px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-accentDeep"
            style={{ background: "#D93E00" }}
          >
            Join Merchant Bridge
          </Link>
        </div>

        <button
          className="-mr-1 flex h-9 w-9 items-center justify-center text-textPrimary md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="mx-auto max-w-[1180px] rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-lg md:hidden">
          <ul className="flex flex-col gap-4 text-[15px] text-textSecondary">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4">
            <AuthControls />
            <Link
              href="/auth/join"
              onClick={() => setOpen(false)}
              className="rounded-full bg-accentDim px-5 py-2.5 text-center text-[14px] font-semibold text-white"
            >
              Join Merchant Bridge
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
