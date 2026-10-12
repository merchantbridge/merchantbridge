import { siteAddress, siteConfig } from "@/config/branding";

export default function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.demerchantbridge.com/#organization",
    name: siteConfig.name,
    url: "https://www.demerchantbridge.com/",
    logo: {
      "@type": "ImageObject",
      url: "https://www.demerchantbridge.com/icon.png",
    },
    email: siteConfig.supportEmail,
    telephone: siteConfig.phoneHref,
    description:
      "Merchant Bridge connects merchants and gifting teams through product listings, profiles and community conversations.",
    address: siteAddress,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: siteConfig.supportEmail,
      telephone: siteConfig.phoneHref,
      areaServed: "US",
      availableLanguage: ["English"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
