import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NotificationCenter from "@/components/merchant/NotificationCenter";

export const dynamic = "force-dynamic";

export default async function MerchantNotificationsPage() {
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

  // Get all notifications
  const { data: notifications } = await supabase
    .from("merchant_notifications")
    .select("*")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: false });

  return (
    <NotificationCenter
      merchant={merchant}
      notifications={notifications || []}
    />
  );
}
