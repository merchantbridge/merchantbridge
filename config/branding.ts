// Merchant Bridge design tokens — single source of truth.
// Light, bright marketplace identity with high-contrast text and crisp actions.

export const colors = {
  // Page + surfaces
  primary: "#FFFFFF",        // Clean bright white page base
  secondary: "#F8FAFC",      // Soft light gray for card surfaces
  secondarySoft: "#F1F5F9",  // Subtle slate panel backgrounds

  // Text
  textPrimary: "#0F172A",    // Deep obsidian navy for headers
  textSecondary: "#475569",  // Dark slate for paragraphs

  // Borders
  borderCustom: "#CBD5E1",   

  // Brand accents — MerchantBridge orange + white
  // accent (#FC4C04) is display-scale only (3.40:1 on white).
  // accentDim (#D93E00) passes WCAG AA at 4.53:1 for body text and white button labels.
  accent: "#FC4C04",
  accentAlt: "#FF6A2B",
  accentDim: "#D93E00",
  accentDeep: "#B33200",
  accentDark: "#8C2700",
  accentTint: "#FFF6F0",
  accentTintSoft: "#FFE8DB",
  accentTintMid: "#FFCFB4",

  // Status
  success: "#0F766E",
  warning: "#FC4C04",
  danger: "#B91C1C",

  // Footer
  footerBg: "#0F172A",
  footerText: "#F8FAFC",
  footerTextSecondary: "#94A3B8",
  footerBorder: "#1E293B",
} as const;

export const fonts = {
  display: ['"Canva Sans"', '"Avenir Next"', "Avenir", '"Helvetica Neue"', "Arial", "sans-serif"],
  body: ['"Canva Sans"', '"Avenir Next"', "Avenir", '"Helvetica Neue"', "Arial", "sans-serif"],
  mono: ['"Canva Sans"', '"Avenir Next"', "Avenir", '"Helvetica Neue"', "Arial", "sans-serif"],
} as const;

export const siteConfig = {
  name: "Merchant Bridge",
  tagline: "Discover. Share. Connect.",
  description:
    "Merchant Bridge finds wholesale, retail, partnership, and sourcing opportunities and matches them to your store. Free to join.",
  supportEmail: "support@demerchantbridge.com",
  phone: "+1 (314) 635-7489",
  phoneHref: "+13146357489",
  address: {
    name: "Merchant Bridge",
    street: "30 N Gould St, Suite #65570",
    locality: "Sheridan",
    region: "WY",
    postalCode: "82801",
    country: "United States",
    countryCode: "US",
  },
} as const;

export const siteAddress = {
  "@type": "PostalAddress",
  streetAddress: siteConfig.address.street,
  addressLocality: siteConfig.address.locality,
  addressRegion: siteConfig.address.region,
  postalCode: siteConfig.address.postalCode,
  addressCountry: siteConfig.address.countryCode,
} as const;

export const opportunityCategories = [
  "Corporate Gifting",
  "Bulk Buyers",
  "Wholesale",
  "Retail",
  "Corporate Procurement",
  "Distributors",
  "Employee Reward Platforms",
  "Hospitality",
  "Events",
 ] as const;

// Verified mapping file matching your exact folder system setup
export const opportunityImages: Record<string, string> = {
  "Corporate Gifting": "/images/coporate gifting.png",
  "Bulk Buyers": "/images/bulk buyers.png", 
  "Wholesale": "/images/whosale.png",
  "Retail": "/images/retail.png",
  "Corporate Procurement": "/images/coporate procurement.png",
  "Distributors": "/images/distributors.png",
  "Employee Reward Platforms": "/images/employee reward platform.png",
  "Hospitality": "/images/hospittality.png", 
  "Events": "/images/events.png",
};

export const opportunityCategoryDescriptions: Record<(typeof opportunityCategories)[number], string> = {
  "Corporate Gifting": "Curated holiday and milestone gifting programs for companies buying at scale.",
  "Bulk Buyers": "Buyers looking to purchase large quantities direct from your store.",
  Wholesale: "Wholesale accounts that stock and resell your products.",
  Retail: "Retail partners looking to carry your brand in-store or online.",
  "Corporate Procurement": "Procurement teams sourcing vendors for recurring business needs.",
  Distributors: "Distribution partners to help your products reach new regions and channels.",
  "Employee Reward Platforms": "Rewards and recognition platforms that feature merchandise for employees.",
  Hospitality: "Hotels, airlines, and hospitality brands sourcing amenities and guest gifts.",
  Events: "Conference, trade show, and event organizers sourcing branded merchandise.",
};

// Fixed to ensure paths don't use raw blank spaces that encode into broken %20 links!
export const supportedPlatforms = [
  { name: "Shopify", slug: "shopify.png" },
  { name: "WooCommerce", slug: "woocommerce.png" },
  { name: "BigCommerce", slug: "big commerce.png" }, // Linked to snake_case format
  { name: "Magento", slug: "magneto.png" },
  { name: "Wix", slug: "wix.png" },
] as const;

export const partnerNetwork = [
  { name: "Goody", slug: "goody" },
  { name: "Sendoso", slug: "sendoso" },
  { name: "Snappy", slug: "snappy", chip: "dark" },
  { name: "Guusto", slug: "guusto" },
  { name: "Stadium", slug: "stadium" },
  { name: "Gifted.co", slug: "gifted" },
] as const;
