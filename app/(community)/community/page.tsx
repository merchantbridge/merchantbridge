import CommunityFeed from "@/components/public/CommunityFeed";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Merchant Bridge Community",
  description: "A place to talk shop with other store owners. Swap what's working, ask for a second opinion, and hear how others handled the same problem.",
};

export default async function CommunityPage() {
  return <main className="min-h-screen min-w-0 bg-[#f0f2f5]"><CommunityFeed /></main>;
}
