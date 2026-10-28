import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/config/branding";
import PwaRegistrar from "@/components/pwa/PwaRegistrar";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import WebSiteJsonLd from "@/components/seo/WebSiteJsonLd";
import { createClient } from "@/lib/supabase/server";
import { normalizeSiteDesign } from "@/lib/content/site-design";
import DesignPreviewBridge from "@/components/public/DesignPreviewBridge";
import SitePagesProvider from "@/components/public/SitePagesProvider";
import { normalizePages } from "@/lib/content/site-pages";
import type { CSSProperties } from "react";



export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  metadataBase: new URL("https://demerchantbridge.com"),
  title: {
    default: "Merchant Bridge | Opportunities for independent e-commerce brands",
    template: "%s | Merchant Bridge",
  },
  description:
    "Merchant Bridge finds wholesale, retail, partnership, and sourcing opportunities and matches them to your store. Free to join.",
  alternates: {
    canonical: "https://demerchantbridge.com/",
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Merchant Bridge | Opportunities for independent e-commerce brands",
    description:
      "Merchant Bridge finds wholesale, retail, partnership, and sourcing opportunities and matches them to your store. Free to join.",
    url: "https://www.demerchantbridge.com/",
    siteName: "Merchant Bridge",
    images: [
      {
        url: "/images/logo-full.png",
        alt: "Merchant Bridge",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Merchant Bridge | Opportunities for independent e-commerce brands",
    description:
      "Merchant Bridge finds wholesale, retail, partnership, and sourcing opportunities and matches them to your store. Free to join.",
    images: ["/images/logo-full.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key,value").in("key", ["site_design", "site_pages", "site_sections"]);
  const values = new Map((data || []).map(item => [item.key, item.value]));
  const design = normalizeSiteDesign(values.get("site_design"));
  const pages = normalizePages(values.get("site_pages"), design, values.get("site_sections"));
  const theme = {
    "--site-accent": design.accent,
    "--site-page": design.pageBackground,
    "--site-heading": design.headingColor,
    "--site-body": design.bodyColor,
    "--site-font": `"${design.fontFamily}"`,
    "--site-space": `${design.sectionSpacing}px`,
    "--site-card-radius": `${design.cardRadius}px`,
    "--site-button-radius": `${design.buttonRadius}px`,
    "--hero-mobile-height": `${design.mobileHeroHeight}px`,
    "--hero-desktop-height": `${design.desktopHeroHeight}px`,
    "--site-container": `${design.containerWidth}px`,
    "--site-header-height": `${design.headerHeight}px`,
    "--hero-title-desktop": `${design.desktopTitleSize}px`,
    "--hero-title-mobile": `${design.mobileTitleSize}px`,
    "--hero-body-desktop": `${design.desktopBodySize}px`,
    "--hero-body-mobile": `${design.mobileBodySize}px`,
    "--site-padding-desktop": `${design.desktopPagePadding}px`,
    "--site-padding-mobile": `${design.mobilePagePadding}px`,
    "--site-card-padding": `${design.cardPadding}px`,
    "--site-button-height": `${design.buttonHeight}px`,
  } as CSSProperties;

  return (
    <html lang="en" data-scroll-behavior="smooth">
  <head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-4F8TJ70RR7"></script>
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-4F8TJ70RR7');
        `,
      }}
    />
  </head>
  <body style={theme}>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <SitePagesProvider initial={pages}><DesignPreviewBridge />{children}</SitePagesProvider>
        <PwaRegistrar />
</body>
    </html>
  );
}
