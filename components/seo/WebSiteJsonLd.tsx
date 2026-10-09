export default function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.demerchantbridge.com/#website",
    url: "https://www.demerchantbridge.com/",
    name: "Merchant Bridge",
    description:
      "Merchant Bridge helps e-commerce merchants improve store readiness and prepare for corporate gifting, wholesale, and commercial opportunities.",
    publisher: {
      "@id": "https://www.demerchantbridge.com/#organization",
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
