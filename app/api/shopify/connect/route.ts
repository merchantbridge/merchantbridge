import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { configuration, hash, nonce, seal, shopDomain } from "@/lib/shopify/security";

export async function GET(request: NextRequest) {
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
    return NextResponse.json({ error: "A merchant account is required." }, { status: 403 });
  }

  const shopParam = request.nextUrl.searchParams.get("shop");
  if (!shopParam) {
    return NextResponse.json({ error: "Missing shop parameter." }, { status: 400 });
  }

  let shop: string;
  try {
    shop = shopDomain(shopParam);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid shop domain." },
      { status: 400 }
    );
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

  const state = nonce();
  const ticket = nonce();
  const browserHash = hash(user.id);

  const admin = createAdminClient();
  const { error: stateError } = await admin
    .from("shopify_oauth_states")
    .insert({
      merchant_id: user.id,
      shop,
      ticket_hash: hash(ticket),
      state_hash: hash(state),
      browser_hash: browserHash,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

  if (stateError) {
    return NextResponse.json({ error: "Unable to start the Shopify connection. Please try again." }, { status: 500 });
  }

  const scopes = "read_products,write_products,read_inventory,write_inventory,read_orders";
  const redirectUri = `${config.origin}/api/shopify/callback`;

  const oauthUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  oauthUrl.searchParams.set("client_id", config.clientId);
  oauthUrl.searchParams.set("scope", scopes);
  oauthUrl.searchParams.set("redirect_uri", redirectUri);
  oauthUrl.searchParams.set("state", state);
  oauthUrl.searchParams.set("grant_options[]", "per-user");

  return NextResponse.redirect(oauthUrl.toString());
}
