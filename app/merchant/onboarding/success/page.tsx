import Link from "next/link";

export const metadata = {
  title: "Application Submitted | Merchant Bridge",
  description: "Your merchant application has been submitted for review.",
};

export default function OnboardingSuccessPage() {
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

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-6 py-20 sm:py-32">
        <div className="rounded-2xl border border-[#EADFD5] bg-white p-8 sm:p-12 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#FF6A00]/10">
            <svg
              className="size-10 text-[#FF6A00]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="mt-6 font-display text-3xl font-semibold text-[#C24E00]">
            Your application is under review
          </h1>

          <p className="mt-4 text-lg text-[#4A4A4A]">
            Thank you for your interest in joining Merchant Bridge. Our team will review your
            application and get back to you within 48 hours.
          </p>

          <div className="mt-8 rounded-xl bg-[#F3F5F2] p-6 text-left">
            <h2 className="font-semibold text-[#C24E00]">What happens next:</h2>
            <ul className="mt-4 space-y-3 text-sm text-[#4A4A4A]">
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#FF6A00] text-xs font-bold text-white">
                  1
                </span>
                <span>
                  Our team reviews your application and business profile
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#FF6A00] text-xs font-bold text-white">
                  2
                </span>
                <span>
                  You&apos;ll receive an email with our decision within 48 hours
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#FF6A00] text-xs font-bold text-white">
                  3
                </span>
                <span>
                  If approved, you&apos;ll get access to your merchant dashboard and opportunity feed
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-[#FF6A00] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#E85D00]"
            >
              Return to home
            </Link>
          </div>

          <p className="mt-4 text-sm text-[#4A4A4A]">
            Questions? Contact us at{" "}
            <a
              href="mailto:support@demerchantbridge.com"
              className="font-semibold text-[#FF6A00] hover:underline"
            >
              support@demerchantbridge.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
