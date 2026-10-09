import Link from "next/link";

export default function CommunityAssistantNotice() {
  return <aside role="status" aria-label="Merchant Bridge assistant update" className="mx-auto mt-4 flex max-w-7xl flex-col gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950 sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <p><strong>Merchant Bridge assistant update:</strong> AI chat is on the main Merchant Bridge website. Community updates and member activity stay here.</p>
    <Link href="https://www.demerchantbridge.com/contact" className="shrink-0 font-bold underline">Message Merchant Bridge support</Link>
  </aside>;
}
