import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Apply for access | Merchant Bridge",
  description:
    "Apply for access to Merchant Bridge. Tell us about your store and we'll review your profile within 48 hours.",
};

export default function MerchantApplyPage() {
  return (
    <div className="min-h-screen bg-[#F3F5F2]">
      <header className="border-b border-[#EADFD5] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Link href="/" className="font-display text-xl font-semibold text-[#C24E00]">
            Merchant Bridge
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-20 sm:py-32">
        <div className="text-center">
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-[#C24E00] sm:text-5xl lg:text-6xl">
            Apply for access to Merchant Bridge.
          </h1>

          <p className="mt-6 text-lg leading-8 text-[#4A4A4A] sm:text-xl">
            Tell us about your store and we'll review your profile within 48 hours. Once you're approved, you'll see wholesale, retail, partnership, and sourcing opportunities matched to what you sell.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/merchant/onboarding"
              className="inline-flex items-center justify-center rounded-xl bg-[#FF6A00] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#E85D00]"
            >
              Apply for access
            </Link>
          </div>

          <p className="mt-6 text-sm text-[#4A4A4A]">
            Free to use. Takes about ten minutes.
          </p>
        </div>

        <div className="mt-20 rounded-2xl border border-[#EADFD5] bg-white p-8 sm:p-12">
          <h2 className="font-display text-2xl font-semibold text-[#C24E00]">
            What you get
          </h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FF6A00]/10">
                <svg className="size-5 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#C24E00]">Opportunities that fit</h3>
                <p className="mt-1 text-sm text-[#4A4A4A]">
                  We match by category, capacity, shipping markets, and customization options, so you aren't scrolling through listings that were never meant for you.
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
                <h3 className="font-semibold text-[#C24E00]">A place to keep track</h3>
                <p className="mt-1 text-sm text-[#4A4A4A]">
                  Save listings, log your applications, and record where each conversation stands.
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
                <h3 className="font-semibold text-[#C24E00]">Help with your supplier profile</h3>
                <p className="mt-1 text-sm text-[#4A4A4A]">
                  If you don't have one, someone from our team will help you write it at no cost.
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
                <h3 className="font-semibold text-[#C24E00]">A weekly digest</h3>
                <p className="mt-1 text-sm text-[#4A4A4A]">
                  Every Monday, we send you the new opportunities that match your profile.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-[#C24E00]">
            What we'll ask
          </h2>
          <p className="mt-4 text-base leading-7 text-[#4A4A4A]">
            Your name and business name, your product category, a short description of your store, your target market, your average order value, your monthly order volume and revenue range, whether you offer custom branding, and where you ship.
          </p>
          <p className="mt-4 text-base leading-7 text-[#4A4A4A]">
            Connect your Shopify store and we'll fill in most of it for you. If you sell elsewhere, there's a short form instead.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-[#C24E00]">
            What happens next
          </h2>
          <ol className="mt-6 space-y-4">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6A00] text-sm font-bold text-white">1</span>
              <p className="text-base leading-7 text-[#4A4A4A]">You submit your application.</p>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6A00] text-sm font-bold text-white">2</span>
              <p className="text-base leading-7 text-[#4A4A4A]">Our team reads your profile. You'll hear from us within 48 hours.</p>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6A00] text-sm font-bold text-white">3</span>
              <p className="text-base leading-7 text-[#4A4A4A]">If we need anything changed, we'll tell you exactly what and why.</p>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6A00] text-sm font-bold text-white">4</span>
              <p className="text-base leading-7 text-[#4A4A4A]">Once you're approved, your dashboard opens and your first matches appear.</p>
            </li>
          </ol>
        </div>

        <div className="mt-12 rounded-2xl border border-[#EADFD5] bg-white p-8">
          <h2 className="font-display text-2xl font-semibold text-[#C24E00]">
            What you should know
          </h2>
          <div className="mt-4 space-y-3 text-base leading-7 text-[#4A4A4A]">
            <p>
              Merchant Bridge is free, and you won't be asked to pay for access. We're a digital agency for e-commerce brands. Once you're set up, we may suggest a paid service if we see a clear gap in your store. You can say no, and it won't affect your access.
            </p>
            <p>
              We use your store data to match you with opportunities and to understand where we might be able to help. See our <Link href="/privacy" className="text-[#C24E00] underline">Privacy Policy</Link>.
            </p>
            <p>
              We don't represent the buyers or brands behind the listings, and we can't guarantee that any application will succeed.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
