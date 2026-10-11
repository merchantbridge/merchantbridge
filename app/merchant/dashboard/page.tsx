import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MerchantDashboard from "@/components/merchant/MerchantDashboard";

export const dynamic = "force-dynamic";

export default async function MerchantDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_active === false) {
    redirect("/auth/sign-in");
  }

  if (profile.role !== "merchant") {
    redirect("/dashboard");
  }

  const { data: merchant } = await supabase
    .from("merchant_profiles")
    .select("*, location")
    .eq("user_id", user.id)
    .single();

  if (!merchant) {
    redirect("/merchant/onboarding");
  }

  // Check application status
  const { data: application } = await supabase
    .from("merchant_applications")
    .select("status")
    .eq("merchant_id", merchant.id)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .single();

  const applicationStatus = application?.status || "not_submitted";

  // If not approved, show holding screen
  if (applicationStatus !== "approved") {
    return <MerchantApplicationStatus status={applicationStatus} />;
  }

  // Fetch dashboard data
  const [opportunities, applications, notifications, unreadCount] = await Promise.all([
    // Get matched opportunities (limit to 3 for preview)
    supabase
      .from("opportunities")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(3),
    
    // Get recent applications
    supabase
      .from("merchant_opportunity_applications")
      .select("*")
      .eq("merchant_id", merchant.id)
      .order("applied_at", { ascending: false })
      .limit(5),
    
    // Get recent notifications
    supabase
      .from("merchant_notifications")
      .select("*")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false })
      .limit(5),
    
    // Get unread notification count
    supabase
      .from("merchant_notifications")
      .select("id", { count: "exact", head: true })
      .eq("merchant_id", merchant.id)
      .eq("read", false),
  ]);

  return (
    <MerchantDashboard
      merchant={merchant}
      opportunities={opportunities.data || []}
      applications={applications.data || []}
      notifications={notifications.data || []}
      unreadCount={unreadCount.count || 0}
    />
  );
}

function MerchantApplicationStatus({ status }: { status: string }) {
  const statusMessages: Record<string, { title: string; message: string; showResubmit?: boolean }> = {
    not_submitted: {
      title: "Complete your application",
      message: "You haven't submitted your merchant application yet. Let's get you set up.",
    },
    submitted: {
      title: "Application under review",
      message: "Your application is being reviewed by our team. We'll get back to you within 48 hours.",
    },
    under_review: {
      title: "Application under review",
      message: "Our team is reviewing your application. We'll be in touch soon.",
    },
    needs_info: {
      title: "Additional information needed",
      message: "We need some more information to process your application. Please check your email for details.",
      showResubmit: true,
    },
    rejected: {
      title: "Application not approved",
      message: "Unfortunately, your application was not approved at this time. Feel free to apply again in the future.",
    },
  };

  const statusInfo = statusMessages[status] || statusMessages.submitted;

  return (
    <div className="min-h-screen bg-[#F3F5F2]">
      <header className="border-b border-[#EADFD5] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <h1 className="font-display text-xl font-semibold text-[#C24E00]">
            Merchant Bridge
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-20">
        <div className="rounded-2xl border border-[#EADFD5] bg-white p-8 sm:p-12 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#FF6A00]/10">
            {status === "submitted" || status === "under_review" ? (
              <svg className="size-10 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="size-10 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
          </div>

          <h1 className="mt-6 font-display text-3xl font-semibold text-[#C24E00]">
            {statusInfo.title}
          </h1>

          <p className="mt-4 text-lg text-[#4A4A4A]">
            {statusInfo.message}
          </p>

          {statusInfo.showResubmit && (
            <div className="mt-8">
              <Link
                href="/merchant/onboarding/manual"
                className="inline-flex items-center justify-center rounded-xl bg-[#FF6A00] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#E85D00]"
              >
                Update and resubmit
              </Link>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-[#EADFD5]">
            <p className="text-sm text-[#4A4A4A]">
              Questions? Contact us at{" "}
              <a
                href="mailto:support@demerchantbridge.com"
                className="font-semibold text-[#FF6A00] hover:underline"
              >
                support@demerchantbridge.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
