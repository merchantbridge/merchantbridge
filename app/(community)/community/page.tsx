import CommunityFeed from "@/components/public/CommunityFeed";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Merchant Bridge Community | Merchant Bridge",
  description: "Meet independent brands, share practical ideas, and build better gifting conversations with Merchant Bridge.",
};

export default async function CommunityPage() {
  return <main className="min-h-screen min-w-0 bg-[#f0f2f5]"><CommunityFeed /></main>;
}
