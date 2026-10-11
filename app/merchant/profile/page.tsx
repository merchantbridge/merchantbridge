import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MerchantProfileEdit from "@/components/merchant/MerchantProfileEdit";

export const dynamic = "force-dynamic";

export default async function MerchantProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name")
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

  return (
    <MerchantProfileEdit
      merchant={merchant}
      fullName={profile.full_name || ""}
    />
  );
}
