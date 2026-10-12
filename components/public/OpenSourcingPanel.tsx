import Link from "next/link";

export default function OpenSourcingPanel(){
  return (
    <aside className="mx-auto my-6 flex max-w-7xl flex-col gap-4 rounded-2xl border border-accentTintMid bg-accentTint p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-accentDim">Open requests</p>
        <h2 className="mt-1 text-xl font-bold text-textPrimary">Current sourcing requests, all in one place.</h2>
        <p className="mt-1 text-sm leading-6 text-textSecondary">Browse requests for products and suppliers. Each one links to the original listing.</p>
      </div>
      <Link href="/sourcing" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-accentDim px-5 py-3 text-sm font-bold text-white transition hover:bg-accentDeep">
        Browse open requests
      </Link>
    </aside>
  )
}
