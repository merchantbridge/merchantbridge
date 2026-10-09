import MemberDirectory from "@/components/community/MemberDirectory";
import OpenSourcingPanel from "@/components/public/OpenSourcingPanel";

export const metadata = { title: "Merchants | Merchant Bridge", description: "Find Merchant Bridge merchants, their stores, and approved products." };

export default function MerchantsPage() {
  return <main className="space-y-6 px-4 py-6 sm:px-6"><OpenSourcingPanel /><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Merchant Bridge marketplace</p><h1 className="text-3xl font-bold">Merchants</h1><p className="text-slate-600">Browse merchant stores and approved gift products.</p><MemberDirectory merchantsOnly /></main>;
}
