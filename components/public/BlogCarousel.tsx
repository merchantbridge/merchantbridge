import Link from "next/link";
import Image from "next/image";
import { getArticles } from "@/lib/blog/articles";
import { opportunityCategories, opportunityImages } from "@/config/branding";

const fallbackImage = (index: number) =>
  opportunityImages[opportunityCategories[index % opportunityCategories.length]];

export default async function BlogCarousel() {
  const articles = (await getArticles()).slice(0, 8);
  if (articles.length === 0) return null;
  const cards = [...articles, ...articles];

  return (
    <section className="page-block overflow-hidden bg-primary">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="font-display text-sm font-semibold text-accent">
              The Journal
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-.03em] text-textPrimary sm:text-4xl">
              Reading for your next sourcing decision.
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex rounded-lg border border-borderCustom px-4 py-2 text-sm font-semibold text-textPrimary transition hover:border-accent hover:text-accent"
          >
            View all articles
          </Link>
        </div>

        <div className="group mt-10 overflow-hidden">
          <div className="flex w-max animate-scrollMarquee group-hover:[animation-play-state:paused]">
            {cards.map((article, index) => (
              <Link
                key={`${article.slug}-${index}`}
                href={`/blog/${article.slug}`}
                className="block w-72 shrink-0 pr-6 sm:w-80"
              >
                <div
                  className="relative aspect-[16/10] overflow-hidden"
                  style={{ borderRadius: "var(--site-card-radius, 12px)" }}
                >
                  <Image
                    src={
                      article.image.startsWith("/images/heroes/")
                        ? fallbackImage(index)
                        : article.image
                    }
                    alt={article.imageAlt || article.title}
                    fill
                    sizes="320px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-accent">
                  {article.category}
                </p>
                <h3 className="mt-2 line-clamp-2 font-display text-lg font-semibold leading-snug text-textPrimary">
                  {article.title}
                </h3>
                <p className="mt-2 text-xs text-textSecondary">{article.date}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}