export default function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.demerchantbridge.com/#organization",
    name: "Merchant Bridge",
    url: "https://www.demerchantbridge.com/",
    logo: {
      "@type": "ImageObject",
      url: "https://www.demerchantbridge.com/images/logo-full.png",
    },
    email: "support@demerchantbridge.com",
    description:
      "Merchant Bridge connects merchants and gifting teams through product listings, profiles and community conversations.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@demerchantbridge.com",
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
