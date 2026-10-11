import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ApplicationTracker from "@/components/merchant/ApplicationTracker";

export const dynamic = "force-dynamic";

export default async function MerchantApplicationsPage() {
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
    .select("id, business_name")
    .eq("user_id", user.id)
    .single();

  if (!merchant) {
    redirect("/merchant/onboarding");
  }

  // Get all applications
  const { data: applications } = await supabase
    .from("merchant_opportunity_applications")
    .select("*")
    .eq("merchant_id", merchant.id)
    .order("applied_at", { ascending: false });

  return (
    <ApplicationTracker
      merchant={merchant}
      applications={applications || []}
    />
  );
}
