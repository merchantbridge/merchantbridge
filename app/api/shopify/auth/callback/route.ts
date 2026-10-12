import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { configuration, validCallback } from "@/lib/shopify/security";

export async function GET(request: NextRequest) {
  const admin = createAdminClient();
  const params = request.nextUrl.searchParams;

  if (!validCallback(params)) {
    return NextResponse.json({ error: "Invalid Shopify callback signature." }, { status: 400 });
  }

  const code = params.get("code");
  const shopParam = params.get("shop");

  if (!code || !shopParam) {
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
    return NextResponse.json({ error: "Shopify token exchange failed." }, { status: 502 });
  }

  const tokenData = await tokenResponse.json() as { access_token?: string; scope?: string };

  if (!tokenData.access_token) {
    return NextResponse.json({ error: "Shopify did not return an access token." }, { status: 502 });
  }

  const shopResponse = await fetch(`https://${shop}/admin/api/${config.version}/shop.json`, {
    headers: { "X-Shopify-Access-Token": tokenData.access_token },
  });

  if (!shopResponse.ok) {
    return NextResponse.json({ error: "Failed to fetch shop details." }, { status: 502 });
  }

  const shopData = await shopResponse.json() as {
    shop?: { email?: string; shop_owner?: string; name?: string };
  };

  const email = shopData.shop?.email;
  const ownerName = shopData.shop?.shop_owner || shopData.shop?.name || shop;

  if (!email) {
    return NextResponse.json({ error: "Could not determine shop email." }, { status: 502 });
  }

  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find((u) => u.email === email);

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
  } else {
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: ownerName,
        shopify_shop: shop,
        signup_source: "shopify",
      },
    });

    if (createError || !newUser.user) {
      return NextResponse.json({ error: "Failed to create user account." }, { status: 500 });
    }

    userId = newUser.user.id;

    await admin.from("profiles").upsert({
      id: userId,
      full_name: ownerName,
      role: "merchant",
    });
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json({ error: "Failed to create sign-in link." }, { status: 500 });
  }

  const encryptedToken = tokenData.access_token;

  const { error: connError } = await admin
    .from("shopify_connections")
    .upsert({
      shop,
      token_cipher: encryptedToken,
      active: true,
      scope: tokenData.scope || "",
    }, { onConflict: "shop" });

  if (connError) {
    console.error("Failed to store Shopify connection:", connError);
  }

  const redirectUrl = new URL(linkData.properties.action_link);
  redirectUrl.searchParams.set("next", "/merchant/onboarding");

  return NextResponse.redirect(redirectUrl.toString());
}
