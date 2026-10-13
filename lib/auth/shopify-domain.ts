export function shopifyDomainFrom(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "")
    .replace(/\.myshopify\.com$/, "");
}

export function shopifyAuthUrl(domain: string) {
  return `/api/shopify/auth?shop=${encodeURIComponent(`${domain}.myshopify.com`)}`;
}

/**
 * Shopify's own install page, used when the app is published. It lets a merchant
 * pick their store themselves, so no store domain has to be typed.
 *
 * A custom (unpublished) app cannot use this: `admin/oauth/authorize` requires
 * the `shop` parameter, so there is no way to start OAuth without knowing the
 * store. Until this is set we fall back to asking for the domain.
 */
export const shopifyInstallUrl = process.env.NEXT_PUBLIC_SHOPIFY_INSTALL_URL || "";

export function startShopifyAuth(raw: string) {
  const domain = shopifyDomainFrom(raw);
  if (!domain) return false;
  window.location.href = shopifyAuthUrl(domain);
  return true;
}