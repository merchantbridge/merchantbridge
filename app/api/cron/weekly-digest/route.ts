import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMerchantNotificationEmail } from "@/lib/email/merchant-notifications";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: merchants, error } = await admin
    .from("marketplace_merchant_profiles")
    .select("id, user_id, full_name, product_category, profile_status")
    .eq("profile_status", "approved");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch merchants" }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const merchant of merchants || []) {
    try {
      const { data: userData } = await admin
        .from("profiles")
        .select("email")
        .eq("id", merchant.user_id)
        .single();

      if (!userData?.email) continue;

      const { data: opportunities } = await admin
        .from("marketplace_opportunities")
        .select("title, opportunity_type:category")
        .eq("status", "live")
        .contains("matching_categories", [merchant.product_category])
        .order("added_at", { ascending: false })
        .limit(5);

      await sendMerchantNotificationEmail(
        userData.email,
        merchant.full_name,
        "weekly_digest",
        { opportunities: (opportunities || []).map((row) => ({ title: row.title, category: row.opportunity_type })) }
      );
      sent++;
    } catch (err) {
      console.error(`Failed to send weekly digest to merchant ${merchant.id}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: merchants?.length || 0 });
}
