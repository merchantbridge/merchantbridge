import Image from "next/image";
import Link from "next/link";
import {
  opportunityCategories,
  opportunityImages,
  opportunityCategoryDescriptions,
} from "@/config/branding";

const links: Record<string, string> = {
  "Wholesale": "/market",
  "Brand Partnership": "/how-it-works",
  "UGC Campaign": "/community",
  "Retail Listing": "/how-it-works",
  "Product Sourcing": "/buyers/apply",
};

export default function OpportunityShowcase() {
  return (
    <section className="page-block bg-secondarySoft">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="font-display text-sm font-semibold text-accent">
            Opportunities
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-.03em] text-textPrimary sm:text-5xl">
            Ways buyers work with brands.
          </h2>
          <p className="mt-5 text-base leading-8 text-textSecondary sm:text-lg">
            Every merchant on Merchant Bridge can be discovered across these
            five opportunity types, from wholesale accounts to product
            sourcing briefs.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {opportunityCategories.map((category) => (
            <Link
              key={category}
              href={links[category] || "/market"}
              className="group site-card border border-borderCustom bg-primary p-3 text-textPrimary transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg"
            >
              <div
                className="relative mb-4 aspect-[4/5] overflow-hidden"
                style={{ borderRadius: "var(--site-card-radius, 12px)" }}
              >
                <Image
                  src={opportunityImages[category]}
                  alt={category}
                  fill
                  sizes="(max-width:1024px) 50vw,20vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-display text-base font-semibold text-textPrimary">
                {category}
              </h3>
              <p className="mt-2 text-sm leading-6 text-textSecondary">
                {opportunityCategoryDescriptions[category]}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}