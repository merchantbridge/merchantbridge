import CommunityFeed from "@/components/public/CommunityFeed";

export const metadata = {
  title: "Merchant Bridge Community",
  description: "Connect, share, and discover practical gifting ideas with the Merchant Bridge community.",
  alternates: {
    canonical: "https://community.demerchantbridge.com/",
  },
};

export default function MerchantBridgePage() {
  return <main className="min-h-screen bg-[#f0f2f5]"><CommunityFeed /></main>;
}
