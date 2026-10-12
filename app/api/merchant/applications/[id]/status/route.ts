import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMerchantNotificationEmail } from "@/lib/email/merchant-notifications";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  const validStatuses = ["applied", "in_conversation", "deal_closed", "not_successful"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data: application, error: fetchError } = await supabase
    .from("marketplace_applications")
    .select("*, marketplace_opportunities(*), marketplace_merchant_profiles(*)")
    .eq("id", id)
    .single();

  if (fetchError || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const admin = createAdminClient();

  const { error: updateError } = await admin
    .from("marketplace_applications")
    .update({
      application_status: status,
      status_updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }

  if (status === "deal_closed") {
    try {
      const merchant = application.marketplace_merchant_profiles;
      const { data: userData } = await admin
        .from("profiles")
        .select("email")
        .eq("id", merchant.user_id)
        .single();

      if (userData?.email) {
        await sendMerchantNotificationEmail(
          userData.email,
          merchant.full_name,
          "deal_closed",
          {
            opportunityTitle: application.marketplace_opportunities?.title || undefined,
          }
        );
      }
    } catch (err) {
      console.error("Failed to send deal_closed email:", err);
    }
  }

  return NextResponse.json({ success: true });
}
