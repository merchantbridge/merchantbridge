import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/shared/Header";
import SiteFooter from "@/components/shared/SiteFooter";
import OpenSourcingPanel from "@/components/public/OpenSourcingPanel";
import { opportunityCategories, opportunityCategoryDescriptions, opportunityImages } from "@/config/branding";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Merchant Bridge | Opportunities for independent e-commerce brands",
  description:
    "Merchant Bridge finds wholesale, retail, partnership, and sourcing opportunities and matches them to your store. Free to join.",
};

const primaryCta =
  "inline-flex min-h-[52px] items-center justify-center rounded-full bg-accentDim px-7 text-[15px] font-bold text-white shadow-[0_10px_30px_-10px_rgba(217,62,0,.6)] transition hover:bg-accentDeep";
const ghostCta =
  "inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-accentDim px-7 text-[15px] font-bold text-accentDim transition hover:bg-accentTint";

export default async function HomePage() {
  return (
    <div className="site-themed min-h-screen">
      <Header />
      <main className="overflow-hidden">
        {/* Hero */}
        <section className="site-hero relative isolate overflow-hidden bg-gradient-to-b from-accentTint via-white to-white pt-32 sm:pt-40">
          <div aria-hidden="true" className="hero-blob-bg absolute inset-0 -z-10" />
          <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 h-[26rem] w-[26rem] rounded-full bg-accentTintMid/40 blur-3xl" />

          <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 pb-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-10 lg:pb-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12.5px] font-bold uppercase tracking-[.16em] text-accentDim ring-1 ring-accentTintMid">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
                Free to join
              </span>

              <h1 className="site-hero-title mt-6 font-semibold leading-[1.04] tracking-[-.04em] text-textPrimary">
                We find the opportunities.{" "}
                <span className="text-accentDim">We make it easy.</span>
              </h1>

              <p className="site-hero-copy mt-6 max-w-xl text-base leading-8 text-textSecondary sm:text-lg">
                Tell us what you sell and what you can supply. We review your profile, then show you wholesale,
                retail, partnership, and sourcing opportunities that suit it — so you apply directly with the source,
                not through us.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link className={primaryCta} href="/merchant/apply">
                  Apply for access <span aria-hidden="true" className="ml-2">↗</span>
                </Link>
                <Link className={ghostCta} href="/how-it-works">
                  See how it works
                </Link>
              </div>

              <p className="mt-7 text-sm leading-6 text-textSecondary">
                <span className="font-semibold text-textPrimary">Merchant Bridge</span> is a digital agency for
                e-commerce brands. You keep every deal you make.
              </p>
            </div>

            {/* Hero image card */}
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-accent/25 via-accentTint to-transparent blur-2xl" />
              <div className="overflow-hidden rounded-[2rem] bg-white p-3 shadow-[0_30px_70px_-30px_rgba(15,23,42,.45)] ring-1 ring-accentTintMid">
                <Image
                  src="/images/heroes/hero-warm.webp"
                  alt="A curated gift box from a Merchant Bridge brand, ready to ship"
                  width={960}
                  height={1024}
                  priority
                  className="h-full w-full rounded-[1.5rem] object-cover"
                />
              </div>

              <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_-18px_rgba(15,23,42,.5)] ring-1 ring-accentTintMid sm:-left-8">
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentTint text-lg">✓</span>
                <div>
                  <p className="text-sm font-bold leading-tight text-textPrimary">Profile reviewed</p>
                  <p className="text-xs leading-tight text-textSecondary">Usually within 48 hours</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Your store, as it is */}
        <section className="page-block border-y border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-accentDim">Your store, as it is</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-4xl">
              Connect the store you already run
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-textSecondary sm:text-lg">
              Connect Shopify in a few clicks. If you sell on WooCommerce, BigCommerce, Magento, Wix, or your own
              site, add your details by hand instead.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4 md:gap-6">
              {["Shopify", "WooCommerce", "BigCommerce", "Magento", "Wix"].map((platform) => (
                <div
                  key={platform}
                  className="flex h-14 min-w-[7.5rem] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-textPrimary shadow-[0_8px_24px_-12px_rgba(15,23,42,.12)]"
                >
                  {platform}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Opportunity categories */}
        <section className="page-block border-b border-slate-200 bg-accentTint py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-accentDim">Where brands grow</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-4xl">
                Nine kinds of opportunity, matched to your store
              </h2>
              <p className="mt-5 text-base leading-8 text-textSecondary sm:text-lg">
                Your category, capacity, shipping markets, and customization options decide what you see. A candle
                brand is never shown a software partnership.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {opportunityCategories.map((category) => (
                <Link
                  key={category}
                  href="/sourcing"
                  className="group overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_-18px_rgba(15,23,42,.25)] ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(217,62,0,.45)] hover:ring-accent"
                >
                  <div className="relative h-44 overflow-hidden bg-accentTint">
                    <Image
                      src={opportunityImages[category]}
                      alt=""
                      fill
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-textPrimary">{category}</h3>
                    <p className="mt-2 text-sm leading-6 text-textSecondary">
                      {opportunityCategoryDescriptions[category]}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How an opportunity reaches you */}
        <section className="page-block border-b border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-accentDim">How an opportunity reaches you</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-4xl">
                We find them. You get matched. You apply directly.
              </h2>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "We find them.",
                  body: "Our team collects wholesale requests, brand partnership calls, creator campaigns, and sourcing needs from public sources, and checks each one is still current before it goes live.",
                  image: "/images/bulk buyers.png",
                  alt: "Pallets of stock moving through a warehouse",
                },
                {
                  title: "You get matched.",
                  body: "Your category, capacity, shipping markets, and customization options decide what you see. A candle brand won't be shown a software partnership.",
                  image: "/images/whosale.png",
                  alt: "Wholesale shelves stocked for retail partners",
                },
                {
                  title: "You apply directly.",
                  body: "Every listing links to the original source. What happens next is between you and them — we don't take a cut.",
                  image: "/images/retail.png",
                  alt: "Independent brand products on a retail shelf",
                },
              ].map((step) => (
                <div key={step.title} className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                  <div className="relative h-48 overflow-hidden bg-accentTint">
                    <Image src={step.image} alt={step.alt} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-textPrimary">{step.title}</h3>
                    <p className="mt-3 text-base leading-7 text-textSecondary">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-10 text-center text-base leading-7 text-textSecondary">
              You keep track. Save listings, log your applications, and update each one as the conversation moves.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="page-block border-b border-slate-200 bg-accentTint py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-accentDim">How it works</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-4xl">
                A good match starts with a complete profile.
              </h2>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { n: "1", title: "Apply.", body: "Tell us about your business and connect your store." },
                {
                  n: "2",
                  title: "Build your profile.",
                  body: "Add your products, capacity, and fulfilment details. Need a supplier profile written? Our team will help at no cost.",
                },
                { n: "3", title: "Wait for review.", body: "We check each profile and reply within 48 hours." },
                {
                  n: "4",
                  title: "Get matched.",
                  body: "Approved merchants see opportunities that fit. More detail gets more relevant matches.",
                },
              ].map((step) => (
                <div key={step.n} className="rounded-2xl bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,.25)] ring-1 ring-slate-200">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accentDim text-lg font-bold text-white">
                    {step.n}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-textPrimary">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-textSecondary">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open requests */}
        <section className="page-block border-b border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-accentDim">Open requests</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-4xl">
                  Current sourcing requests, all in one place.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-textSecondary sm:text-lg">
                  Browse requests for products and suppliers. Each one links to the original listing, so you apply
                  with the source directly.
                </p>
                <Link href="/sourcing" className={`${primaryCta} mt-8`}>
                  Browse open requests
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { image: "/images/opportunities/wholesale.jpg", label: "Wholesale" },
                  { image: "/images/opportunities/brand-partnership.jpg", label: "Brand partnerships" },
                  { image: "/images/opportunities/product-sourcing.jpg", label: "Product sourcing" },
                  { image: "/images/opportunities/retail-listing.jpg", label: "Retail listings" },
                ].map((tile) => (
                  <div key={tile.label} className="overflow-hidden rounded-2xl bg-accentTint ring-1 ring-slate-200">
                    <div className="relative h-28">
                      <Image src={tile.image} alt="" fill sizes="(min-width:1024px) 22vw, 45vw" className="object-cover" />
                    </div>
                    <p className="px-4 py-3 text-sm font-bold text-textPrimary">{tile.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How Merchant Bridge is funded */}
        <section className="page-block border-b border-slate-200 bg-accentTint py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-4xl">
              How Merchant Bridge is funded
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-textSecondary sm:text-lg">
              Access to Merchant Bridge is free and will stay free. We&apos;re run by Merchant Bridge, a digital agency
              that offers design, content, marketing, AI video, and social media services to e-commerce stores.
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-textSecondary sm:text-lg">
              Once you&apos;re set up, our team may notice something in your store that could be stronger — product pages,
              branding, or content — and offer you a paid service for it. You can say no. It has no effect on your
              access.
            </p>
          </div>
        </section>

        <OpenSourcingPanel />
      </main>
      <SiteFooter />
    </div>
  );
}
