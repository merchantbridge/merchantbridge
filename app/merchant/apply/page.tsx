import Link from "next/link";
import { siteConfig } from "@/config/branding";

export const metadata = {
  title: "Apply for Access | Merchant Bridge",
  description: "Join Merchant Bridge and connect with buyers, corporate partners, and opportunity providers.",
};

export default function MerchantApplyPage() {
  return (
    <div className="min-h-screen bg-[#F3F5F2]">
      {/* Header */}
      <header className="border-b border-[#EADFD5] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Link href="/" className="font-display text-xl font-semibold text-[#C24E00]">
            Merchant Bridge
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-4xl px-6 py-20 sm:py-32">
        <div className="text-center">
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-[#C24E00] sm:text-5xl lg:text-6xl">
            Join a curated community of independent brands
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-[#4A4A4A] sm:text-xl">
            {siteConfig.description}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/merchant/onboarding"
              className="inline-flex items-center justify-center rounded-xl bg-[#FF6A00] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#E85D00]"
            >
              Apply for access
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-xl border border-[#EADFD5] bg-white px-8 py-4 text-sm font-semibold text-[#C24E00] transition hover:border-[#FF6A00] hover:text-[#FF6A00]"
            >
              Learn more
            </Link>
          </div>

          <p className="mt-6 text-sm text-[#4A4A4A]">
            Applications are reviewed within 48 hours
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 rounded-2xl border border-[#EADFD5] bg-white p-8 sm:p-12">
          <h2 className="font-display text-2xl font-semibold text-[#C24E00]">
            What you&apos;ll get access to
          </h2>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FF6A00]/10">
                <svg className="size-5 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#C24E00]">Curated opportunities</h3>
                <p className="mt-1 text-sm text-[#4A4A4A]">
                  Hand-picked sourcing opportunities matched to your profile
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FF6A00]/10">
                <svg className="size-5 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#C24E00]">Direct connections</h3>
                <p className="mt-1 text-sm text-[#4A4A4A]">
                  Connect with corporate buyers and partners directly
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FF6A00]/10">
                <svg className="size-5 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#C24E00]">Quality-focused</h3>
                <p className="mt-1 text-sm text-[#4A4A4A]">
                  A curated community of verified, quality brands
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FF6A00]/10">
                <svg className="size-5 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#C24E00]">Fast onboarding</h3>
                <p className="mt-1 text-sm text-[#4A4A4A]">
                  Connect your store or fill out a simple form
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
