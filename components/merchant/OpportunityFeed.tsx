"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Merchant {
  id: string;
  business_name: string;
}

interface Opportunity {
  id: string;
  title: string;
  category: string;
  description: string;
  requirements: string;
  submission_url: string;
  created_at: string;
}

interface OpportunityFeedProps {
  merchant: Merchant;
  opportunities: Opportunity[];
  savedIds: Set<string>;
}

export default function OpportunityFeed({
  merchant,
  opportunities,
  savedIds,
}: OpportunityFeedProps) {
  const supabase = createClient();
  const [savedSet, setSavedSet] = useState(savedIds);
  const [appliedSet, setAppliedSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());

  async function toggleSave(opportunityId: string) {
    setLoading((prev) => new Set(prev).add(opportunityId));

    try {
      if (savedSet.has(opportunityId)) {
        // Remove from saved
        await supabase
          .from("merchant_opportunity_applications")
          .delete()
          .eq("merchant_id", merchant.id)
          .eq("opportunity_id", opportunityId)
          .eq("status", "saved");

        setSavedSet((prev) => {
          const next = new Set(prev);
          next.delete(opportunityId);
          return next;
        });
      } else {
        // Add to saved
        await supabase.from("merchant_opportunity_applications").insert({
          merchant_id: merchant.id,
          opportunity_id: opportunityId,
          opportunity_title: opportunities.find((o) => o.id === opportunityId)?.title || "",
          opportunity_type: opportunities.find((o) => o.id === opportunityId)?.category || "",
          status: "saved",
        });

        setSavedSet((prev) => new Set(prev).add(opportunityId));
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    } finally {
      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(opportunityId);
        return next;
      });
    }
  }

  async function markAsApplied(opportunityId: string) {
    setLoading((prev) => new Set(prev).add(opportunityId));

    try {
      const opportunity = opportunities.find((o) => o.id === opportunityId);
      if (!opportunity) return;

      // Check if already exists
      const { data: existing } = await supabase
        .from("merchant_opportunity_applications")
        .select("id")
        .eq("merchant_id", merchant.id)
        .eq("opportunity_id", opportunityId)
        .single();

      if (existing) {
        // Update to applied
        await supabase
          .from("merchant_opportunity_applications")
          .update({ status: "applied" })
          .eq("id", existing.id);
      } else {
        // Create new application
        await supabase.from("merchant_opportunity_applications").insert({
          merchant_id: merchant.id,
          opportunity_id: opportunityId,
          opportunity_title: opportunity.title,
          opportunity_type: opportunity.category,
          status: "applied",
        });
      }

      setAppliedSet((prev) => new Set(prev).add(opportunityId));
      setSavedSet((prev) => new Set(prev).add(opportunityId));
    } catch (error) {
      console.error("Error marking as applied:", error);
    } finally {
      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(opportunityId);
        return next;
      });
    }
  }

  // Sort opportunities: saved first, then by date
  const sortedOpportunities = [...opportunities].sort((a, b) => {
    const aSaved = savedSet.has(a.id) ? 1 : 0;
    const bSaved = savedSet.has(b.id) ? 1 : 0;
    if (aSaved !== bSaved) return bSaved - aSaved;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Separate into active and archived (older than 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeOpportunities = sortedOpportunities.filter(
    (opp) => new Date(opp.created_at) > thirtyDaysAgo
  );
  const archivedOpportunities = sortedOpportunities.filter(
    (opp) => new Date(opp.created_at) <= thirtyDaysAgo
  );

  return (
    <div className="min-h-screen bg-[#F3F5F2]">
      {/* Header */}
      <header className="border-b border-[#EADFD5] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/merchant/dashboard" className="font-display text-xl font-semibold text-[#C24E00]">
            ← Back to dashboard
          </Link>
          <h1 className="font-display text-xl font-semibold text-[#C24E00]">
            Opportunities
          </h1>
          <div className="flex size-10 items-center justify-center rounded-full bg-[#FF6A00] text-sm font-semibold text-white">
            {merchant.business_name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-[#C24E00]">
            Matched opportunities
          </h2>
          <p className="mt-2 text-[#4A4A4A]">
            Opportunities curated for your business profile
          </p>
        </div>

        {activeOpportunities.length === 0 && archivedOpportunities.length === 0 ? (
          <div className="rounded-2xl border border-[#EADFD5] bg-white p-12 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#FF6A00]/10">
              <svg className="size-8 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-[#C24E00]">
              No opportunities found
            </h3>
            <p className="mt-2 text-[#4A4A4A]">
              We&apos;re actively sourcing opportunities in your category. Check back soon.
            </p>
          </div>
        ) : (
          <>
            {/* Active Opportunities */}
            {activeOpportunities.length > 0 && (
              <div className="space-y-4">
                {activeOpportunities.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    isSaved={savedSet.has(opportunity.id)}
                    isApplied={appliedSet.has(opportunity.id)}
                    isLoading={loading.has(opportunity.id)}
                    onSave={() => toggleSave(opportunity.id)}
                    onApply={() => markAsApplied(opportunity.id)}
                  />
                ))}
              </div>
            )}

            {/* Archived Opportunities */}
            {archivedOpportunities.length > 0 && (
              <div className="mt-12">
                <h3 className="font-display text-lg font-semibold text-[#4A4A4A]">
                  Archived opportunities (older than 30 days)
                </h3>
                <div className="mt-4 space-y-4">
                  {archivedOpportunities.map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      isSaved={savedSet.has(opportunity.id)}
                      isApplied={appliedSet.has(opportunity.id)}
                      isLoading={loading.has(opportunity.id)}
                      onSave={() => toggleSave(opportunity.id)}
                      onApply={() => markAsApplied(opportunity.id)}
                      isArchived
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function OpportunityCard({
  opportunity,
  isSaved,
  isApplied,
  isLoading,
  onSave,
  onApply,
  isArchived = false,
}: {
  opportunity: Opportunity;
  isSaved: boolean;
  isApplied: boolean;
  isLoading: boolean;
  onSave: () => void;
  onApply: () => void;
  isArchived?: boolean;
}) {
  const requirements = opportunity.requirements
    ? opportunity.requirements.split("\n").filter(Boolean).slice(0, 5)
    : [];

  return (
    <div
      className={`rounded-2xl border bg-white p-6 transition ${
        isArchived
          ? "border-[#EADFD5] opacity-60"
          : "border-[#EADFD5] hover:border-[#FF6A00]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <span className="inline-block rounded-full bg-[#FF6A00]/10 px-3 py-1 text-xs font-semibold text-[#FF6A00]">
            {opportunity.category}
          </span>
          <h3 className="mt-3 font-display text-lg font-semibold text-[#C24E00]">
            {opportunity.title}
          </h3>
          <p className="mt-2 text-sm text-[#4A4A4A] line-clamp-3">
            {opportunity.description}
          </p>

          {requirements.length > 0 && (
            <ul className="mt-4 space-y-1">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-[#4A4A4A]">
                  <span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-[#FF6A00]" />
                  {req}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onSave}
            disabled={isLoading}
            className="flex size-10 items-center justify-center rounded-lg border border-[#EADFD5] text-[#4A4A4A] transition hover:border-[#FF6A00] hover:text-[#FF6A00] disabled:opacity-50"
            title={isSaved ? "Remove from saved" : "Save for later"}
          >
            {isSaved ? (
              <svg className="size-5 text-[#FF6A00]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            ) : (
              <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>

          {isApplied && (
            <span className="inline-flex items-center justify-center rounded-lg bg-green-100 px-3 py-2 text-xs font-semibold text-green-700">
              Applied
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        {opportunity.submission_url && (
          <a
            href={opportunity.submission_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-[#FF6A00] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#E85D00]"
          >
            View opportunity
          </a>
        )}

        {!isApplied && !isArchived && (
          <button
            onClick={onApply}
            disabled={isLoading}
            className="rounded-xl border border-[#EADFD5] px-6 py-2.5 text-sm font-semibold text-[#C24E00] transition hover:border-[#FF6A00] hover:text-[#FF6A00] disabled:opacity-50"
          >
            I applied
          </button>
        )}
      </div>
    </div>
  );
}
