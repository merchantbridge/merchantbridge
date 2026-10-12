import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Application submitted | Merchant Bridge",
  description: "Thanks for applying. Our team is reviewing your profile.",
};

export default function OnboardingSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Thanks. We&apos;ve got your application.
          </h1>

          <p className="text-slate-600 mb-6">
            Our team is reading through your profile now. You&apos;ll hear from us within 48 hours, and we&apos;ll email you as soon as there&apos;s an update.
          </p>

          <p className="text-sm text-slate-500 mb-8">
            While you wait, you could look through the sourcing requests that are open right now, or read a few posts in the community.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/sourcing"
              className="inline-block w-full px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              Browse open requests
            </Link>
            <Link
              href="/community"
              className="inline-block w-full px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
            >
              Visit the community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
