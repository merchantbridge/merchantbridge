import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "merchant") {
    return NextResponse.json({ error: "Merchant account required." }, { status: 403 });
  }

  const { data: merchant } = await supabase
    .from("merchant_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!merchant) {
    return NextResponse.json({ error: "Merchant profile not found." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { type, title, message, action_url } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "Type, title, and message are required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { error } = await admin.from("merchant_notifications").insert({
      merchant_id: merchant.id,
      type,
      title,
      message,
      action_url: action_url || null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: merchant } = await supabase
    .from("merchant_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!merchant) {
    return NextResponse.json({ error: "Merchant profile not found." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { notification_id, read } = body;

    if (!notification_id) {
      return NextResponse.json(
        { error: "Notification ID is required." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("merchant_notifications")
      .update({ read: read !== undefined ? read : true })
      .eq("id", notification_id)
      .eq("merchant_id", merchant.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
