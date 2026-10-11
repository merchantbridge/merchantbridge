"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Merchant {
  id: string;
  business_name: string;
  product_category: string;
  target_market: string;
  average_order_value: string;
  monthly_order_volume: string;
  custom_branding_packaging: boolean;
  shipping_markets: string[];
  current_monthly_revenue: string;
  current_sales_channels: string[];
  business_description: string;
  supplier_profile_document_status: string;
  location: string;
}

interface Opportunity {
  id: string;
  title: string;
  category: string;
  description: string;
  requirements: string;
  submission_url: string;
}

interface Application {
  id: string;
  opportunity_title: string;
  opportunity_type: string;
  status: string;
  notes: string;
  applied_at: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url: string;
  read: boolean;
  created_at: string;
}

interface MerchantDashboardProps {
  merchant: Merchant;
  opportunities: Opportunity[];
  applications: Application[];
  notifications: Notification[];
  unreadCount: number;
}

export default function MerchantDashboard({
  merchant,
  opportunities,
  applications,
  notifications,
  unreadCount,
}: MerchantDashboardProps) {
  const supabase = createClient();

  const completionFields = [
    merchant.business_name,
    merchant.product_category,
    merchant.target_market,
    merchant.average_order_value,
    merchant.monthly_order_volume,
    merchant.current_monthly_revenue,
    merchant.business_description,
    merchant.location,
    merchant.shipping_markets.length > 0,
    merchant.current_sales_channels.length > 0,
    merchant.supplier_profile_document_status === "uploaded_and_approved",
  ];
  const profileCompletion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  async function markNotificationAsRead(notificationId: string) {
    await supabase
      .from("merchant_notifications")
      .update({ read: true })
      .eq("id", notificationId);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-accentSoft text-accentDim";
      case "in_conversation":
        return "bg-yellow-100 text-yellow-700";
      case "deal_closed":
        return "bg-green-100 text-green-700";
      case "not_successful":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F2]">
      {/* Header */}
      <header className="border-b border-[#EADFD5] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-semibold text-[#C24E00]">
            Merchant Bridge
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/merchant/notifications"
              className="relative flex size-10 items-center justify-center rounded-full border border-[#EADFD5] text-[#4A4A4A] hover:border-[#FF6A00] hover:text-[#FF6A00]"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#FF6A00] text-xs font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/merchant/profile"
              className="flex size-10 items-center justify-center rounded-full bg-[#FF6A00] text-sm font-semibold text-white"
            >
              {merchant.business_name.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-[#C24E00]">
            Welcome back, {merchant.business_name}
          </h1>
          <p className="mt-2 text-[#4A4A4A]">
            Here&apos;s what&apos;s happening with your store
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Area 1: Opportunity Feed Preview */}
          <section className="rounded-2xl border border-[#EADFD5] bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[#C24E00]">
                Recent opportunities
              </h2>
              <Link
                href="/merchant/opportunities"
                className="text-sm font-semibold text-[#FF6A00] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-4">
              {opportunities.length === 0 ? (
                <div className="rounded-xl bg-[#F3F5F2] p-6 text-center">
                  <p className="text-sm text-[#4A4A4A]">
                    We&apos;re actively sourcing opportunities in your category. Check back soon.
                  </p>
                </div>
              ) : (
                opportunities.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className="rounded-xl border border-[#EADFD5] p-4 transition hover:border-[#FF6A00]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <span className="inline-block rounded-full bg-[#FF6A00]/10 px-3 py-1 text-xs font-semibold text-[#FF6A00]">
                          {opportunity.category}
                        </span>
                        <h3 className="mt-2 font-semibold text-[#C24E00]">
                          {opportunity.title}
                        </h3>
                        <p className="mt-1 text-sm text-[#4A4A4A] line-clamp-2">
                          {opportunity.description}
                        </p>
                      </div>
                      {opportunity.submission_url && (
                        <a
                          href={opportunity.submission_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-lg bg-[#FF6A00] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#E85D00]"
                        >
                          View
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Area 2: Profile Completion */}
          <section className="rounded-2xl border border-[#EADFD5] bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-[#C24E00]">
              Profile completion
            </h2>
            <p className="mt-1 text-sm text-[#4A4A4A]">
              Complete your profile to get better opportunity matches
            </p>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#C24E00]">
                  {profileCompletion}%
                </span>
                <Link
                  href="/merchant/profile"
                  className="text-sm font-semibold text-[#FF6A00] hover:underline"
                >
                  {profileCompletion < 100 ? "Complete profile" : "View profile"}
                </Link>
              </div>
              <div className="h-3 rounded-full bg-[#E8EBE6] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#FF6A00] transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>

            {profileCompletion < 100 && (
              <div className="mt-4 space-y-2">
                {!merchant.business_description && (
                  <Link
                    href="/merchant/profile"
                    className="flex items-center gap-2 text-sm text-[#4A4A4A] hover:text-[#FF6A00]"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    Add business description
                  </Link>
                )}
                {merchant.supplier_profile_document_status !== "uploaded_and_approved" && (
                  <Link
                    href="/merchant/profile"
                    className="flex items-center gap-2 text-sm text-[#4A4A4A] hover:text-[#FF6A00]"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    Upload supplier profile document
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* Area 3: Application Tracker */}
          <section className="rounded-2xl border border-[#EADFD5] bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[#C24E00]">
                Your applications
              </h2>
              <Link
                href="/merchant/applications"
                className="text-sm font-semibold text-[#FF6A00] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {applications.length === 0 ? (
                <div className="rounded-xl bg-[#F3F5F2] p-6 text-center">
                  <p className="text-sm text-[#4A4A4A]">
                    You haven&apos;t applied to any opportunities yet
                  </p>
                  <Link
                    href="/merchant/opportunities"
                    className="mt-2 inline-block text-sm font-semibold text-[#FF6A00] hover:underline"
                  >
                    Browse opportunities
                  </Link>
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-xl border border-[#EADFD5] p-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#C24E00]">
                        {app.opportunity_title}
                      </h3>
                      <p className="mt-1 text-xs text-[#4A4A4A]">
                        Applied {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(app.status)}`}
                    >
                      {app.status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Area 4: Notifications */}
          <section className="rounded-2xl border border-[#EADFD5] bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[#C24E00]">
                Notifications
              </h2>
              <Link
                href="/merchant/notifications"
                className="text-sm font-semibold text-[#FF6A00] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="rounded-xl bg-[#F3F5F2] p-6 text-center">
                  <p className="text-sm text-[#4A4A4A]">
                    No new notifications
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                      notification.read
                        ? "border-[#EADFD5] bg-white"
                        : "border-[#FF6A00] bg-[#FF6A00]/5"
                    }`}
                    onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FF6A00]/10">
                      <svg className="size-4 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#C24E00]">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#4A4A4A]">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-[#4A4A4A]">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="flex size-2 shrink-0 rounded-full bg-[#FF6A00]" />
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
