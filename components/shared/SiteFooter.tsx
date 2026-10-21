import Link from "next/link";
import { siteConfig } from "@/config/branding";

const COMMUNITY_URL = "https://app.demerchantbridge.com/";
const groups = [
  ["Product", [["/how-it-works", "How It Works"], ["/blog", "MerchantBridge Blog"], [COMMUNITY_URL, "Community"]]],

  ["Company", [["/merchantbridge", "About MerchantBridge"], ["/about", "Our Company"], ["/faq", "FAQ"], ["/contact", "Contact"]]],
  ["Legal", [["/privacy", "Privacy"], ["/terms", "Terms"], ["/cookies", "Cookies"]]],
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white text-textPrimary">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-horizontal.png" alt="MerchantBridge" className="h-9 w-auto object-contain" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-textSecondary">
              A practical community for brands, gifting teams, and partners building better commercial relationships.
            </p>
            <div className="mt-4 flex flex-col gap-1.5">
              <a href={`tel:${siteConfig.phoneHref}`} className="text-sm font-semibold text-accentDim hover:text-accentDeep">
                {siteConfig.phone}
              </a>
              <a href={`mailto:${siteConfig.supportEmail}`} className="text-sm font-semibold text-accentDim hover:text-accentDeep">
                {siteConfig.supportEmail}
              </a>
            </div>
          </div>

          {groups.map(([heading, links]) => (
            <div key={heading}>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-textPrimary">{heading}</p>
              <ul className="space-y-2.5">
                {links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-textSecondary transition hover:text-accentDim">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-textSecondary">
            © {new Date().getFullYear()} MerchantBridge. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href={COMMUNITY_URL} className="text-xs text-textSecondary hover:text-accentDim">app.demerchantbridge.com</a>
            <Link href="/console" className="text-xs text-textSecondary hover:text-accentDim">developers</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
