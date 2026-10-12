import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { configuration, hash, seal, validCallback } from "@/lib/shopify/security";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  const params = request.nextUrl.searchParams;

  if (!validCallback(params)) {
    return NextResponse.json({ error: "Invalid Shopify callback signature." }, { status: 400 });
  }

  const code = params.get("code");
  const state = params.get("state");
  const shopParam = params.get("shop");

  if (!code || !state || !shopParam) {
    return NextResponse.json({ error: "Missing OAuth parameters." }, { status: 400 });
  }

  let shop: string;
  try {
    shop = shopParam.trim().toLowerCase().replace(/^https:\/\//, "").replace(/\/$/, "");
    if (!/^[a-z0-9][a-z0-9-]{0,62}\.myshopify\.com$/.test(shop)) {
      throw new Error("Invalid shop domain.");
    }
  } catch {
    return NextResponse.json({ error: "Invalid shop domain." }, { status: 400 });
  }

  let config;
  try {
    config = configuration();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Shopify is not configured." },
      { status: 500 }
    );
  }

  const admin = createAdminClient();

  const { data: stateRecord, error: stateError } = await admin
    .from("shopify_oauth_states")
    .select("id, ticket_hash, browser_hash, expires_at")
    .eq("state_hash", hash(state))
    .eq("shop", shop)
    .single();

  if (stateError || !stateRecord) {
    return NextResponse.json({ error: "Invalid or expired OAuth state." }, { status: 400 });
  }

  if (new Date(stateRecord.expires_at) < new Date()) {
    await admin.from("shopify_oauth_states").delete().eq("id", stateRecord.id);
    return NextResponse.json({ error: "OAuth state has expired. Please try connecting again." }, { status: 400 });
  }

  if (stateRecord.browser_hash !== hash(user.id)) {
    return NextResponse.json({ error: "OAuth state does not match this browser session." }, { status: 400 });
  }

  const tokenUrl = `https://${shop}/admin/oauth/access_token`;
  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.secret,
      code,
    }),
  });

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text().catch(() => "");
    return NextResponse.json(
      { error: "Shopify token exchange failed.", details: errorBody },
      { status: 502 }
    );
  }

  const tokenData = await tokenResponse.json() as {
    access_token?: string;
    scope?: string;
    expires_in?: number;
    associated_user_scope?: string;
    associated_user?: { id?: number; first_name?: string; last_name?: string; email?: string };
  };

  if (!tokenData.access_token) {
    return NextResponse.json({ error: "Shopify did not return an access token." }, { status: 502 });
  }

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000)
    : null;

  const { data: merchantProfile } = await admin
    .from("merchant_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!merchantProfile) {
    return NextResponse.json({ error: "Merchant profile not found." }, { status: 404 });
  }

  const encryptedToken = seal(tokenData.access_token, shop);

  const { error: upsertError } = await admin
    .from("shopify_connections")
    .upsert({
      merchant_id: merchantProfile.id,
      shop,
      token_cipher: encryptedToken,
      active: true,
      scope: tokenData.scope || "",
      last_error: null,
      expires_at: expiresAt?.toISOString() || null,
    }, { onConflict: "merchant_id" });

  if (upsertError) {
    return NextResponse.json({ error: "Unable to store the Shopify connection." }, { status: 500 });
  }

  await admin.from("shopify_oauth_states").delete().eq("id", stateRecord.id);

  const redirectUrl = new URL("/merchant/profile", request.url);
  redirectUrl.searchParams.set("shopify", "connected");
  return NextResponse.redirect(redirectUrl.toString());
}
