import { NextRequest, NextResponse } from "next/server";
import { configuration, hash, nonce, shopDomain } from "@/lib/shopify/security";

export async function GET(request: NextRequest) {
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
  const redirectUri = `${config.origin}/api/shopify/auth/callback`;

  const scopes = "read_products,write_products,read_inventory,write_inventory,read_orders";

  const oauthUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  oauthUrl.searchParams.set("client_id", config.clientId);
  oauthUrl.searchParams.set("scope", scopes);
  oauthUrl.searchParams.set("redirect_uri", redirectUri);
  oauthUrl.searchParams.set("state", state);
  oauthUrl.searchParams.set("grant_options[]", "per-user");

  return NextResponse.redirect(oauthUrl.toString());
}
