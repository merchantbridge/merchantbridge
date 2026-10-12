import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/shared/Header";
import SiteFooter from "@/components/shared/SiteFooter";

export const metadata: Metadata = {
  title: "For buyers",
  description:
    "Tell us what you need. The Merchant Bridge team reviews every buyer request and matches you with independent brands that match.",
};

const reasons = [
  {
    title: "We read every request",
    body: "There is no self-serve signup. Our team reviews what you need and checks it against real brands before anything goes live.",
  },
  {
    title: "We check the brand side too",
    body: "A brief is only useful if the brands answering it can actually fulfil it. We confirm capacity, lead times, and shipping regions first.",
  },
  {
    title: "You talk to a person",
    body: "You get one point of contact for the whole process instead of a queue of unverified listings.",
  },
];

export default function BuyerApplyPage() {
  return (
    <div className="site-themed min-h-screen">
      <Header />
      <main>
        <section className="site-hero relative isolate overflow-hidden bg-gradient-to-b from-accentTint via-white to-white pt-32 sm:pt-40">
          <div aria-hidden="true" className="hero-blob-bg absolute inset-0 -z-10" />

          <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 pb-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-10 lg:pb-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12.5px] font-bold uppercase tracking-[.16em] text-accentDim ring-1 ring-accentTintMid">
                For gifting buyers
              </span>

              <h1 className="site-hero-title mt-6 font-semibold leading-[1.04] tracking-[-.04em] text-textPrimary">
                Tell us what you need. <span className="text-accentDim">We handle the rest.</span>
              </h1>

              <p className="site-hero-copy mt-6 max-w-xl text-base leading-8 text-textSecondary sm:text-lg">
                Buyer access is handled by our team, not a signup form. Share your brief and a member of the Merchant
                Bridge team will review it, match you with brands that can actually fulfil it, and set up your account
                with you.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-accentDim px-7 text-[15px] font-bold text-white shadow-[0_10px_30px_-10px_rgba(217,62,0,.6)] transition hover:bg-accentDeep"
                >
                  Send us your brief <span aria-hidden="true" className="ml-2">↗</span>
                </Link>
                <Link
                  href="/sourcing"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-accentDim px-7 text-[15px] font-bold text-accentDim transition hover:bg-accentTint"
                >
                  Browse open requests
                </Link>
              </div>

              <p className="mt-7 text-sm leading-6 text-textSecondary">
                Already approved?{" "}
                <Link href="/auth/sign-in" className="font-semibold text-accentDim hover:text-accentDeep">
                  Sign in
                </Link>{" "}
                to your buyer dashboard.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-accent/25 via-accentTint to-transparent blur-2xl" />
              <div className="overflow-hidden rounded-[2rem] bg-white p-3 shadow-[0_30px_70px_-30px_rgba(15,23,42,.45)] ring-1 ring-accentTintMid">
                <Image
                  src="/images/heroes/hero-warm.webp"
                  alt="A curated gift box prepared for a corporate gifting order"
                  width={960}
                  height={1024}
                  priority
                  className="h-full w-full rounded-[1.5rem] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="page-block border-y border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-accentDim">How it works</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-4xl">
                Why buyers are set up by our team
              </h2>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {reasons.map((reason, index) => (
                <div
                  key={reason.title}
                  className="rounded-2xl bg-accentTint p-6 ring-1 ring-accentTintMid"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accentDim text-lg font-bold text-white">
                    {index + 1}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-textPrimary">{reason.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-textSecondary">{reason.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
