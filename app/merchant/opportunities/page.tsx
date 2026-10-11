import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OpportunityFeed from "@/components/merchant/OpportunityFeed";

export const dynamic = "force-dynamic";

export default async function MerchantOpportunitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "merchant") {
    redirect("/dashboard");
  }

  const { data: merchant } = await supabase
    .from("merchant_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!merchant) {
    redirect("/merchant/onboarding");
  }

  // Get all active opportunities
  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  // Get merchant's saved opportunities
  const { data: savedOpportunities } = await supabase
    .from("merchant_opportunity_applications")
    .select("opportunity_id")
    .eq("merchant_id", merchant.id);

  const savedIds = new Set(savedOpportunities?.map((app) => app.opportunity_id) || []);

  // Filter opportunities based on merchant profile (matching logic)
  const matchedOpportunities = (opportunities || []).filter((opp) => {
    // Category match
    if (merchant.product_category && opp.category) {
      const oppCategory = opp.category.toLowerCase();
      const merchantCategory = merchant.product_category.toLowerCase();
      if (oppCategory.includes(merchantCategory) || merchantCategory.includes(oppCategory)) {
        return true;
      }
    }

    // Shipping market match
    if (merchant.shipping_markets && merchant.shipping_markets.length > 0) {
      const oppRequirements = opp.requirements?.toLowerCase() || "";
      const hasMatchingMarket = merchant.shipping_markets.some((market: string) =>
        oppRequirements.includes(market.toLowerCase())
      );
      if (hasMatchingMarket) return true;
    }

    // Custom branding/packaging match
    if (merchant.custom_branding_packaging) {
      const oppRequirements = opp.requirements?.toLowerCase() || "";
      if (oppRequirements.includes("custom") || oppRequirements.includes("branding")) {
        return true;
      }
    }

    // If no specific match, show if it's a general opportunity
    return opp.category === "General" || !opp.category;
  });

  return (
    <OpportunityFeed
      merchant={merchant}
      opportunities={matchedOpportunities}
      savedIds={savedIds}
    />
  );
}
