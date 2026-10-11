"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MerchantOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleShopifyConnect() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/sign-in");
        return;
      }

      // Check if user already has a merchant profile
      const { data: merchant } = await supabase
        .from("merchant_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!merchant) {
        // Create merchant profile first
        const { error: createError } = await supabase
          .from("merchant_profiles")
          .insert({
            user_id: user.id,
            business_name: "",
            business_email: user.email,
          });

        if (createError) throw createError;
      }

      // Redirect to Shopify OAuth flow
      router.push("/api/shopify/oauth/authorize");
    } catch (error) {
      console.error("Shopify connection error:", error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F5F2]">
      {/* Header */}
      <header className="border-b border-[#EADFD5] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Link href="/" className="font-display text-xl font-semibold text-[#C24E00]">
            Merchant Bridge
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <div className="text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-[#FF6A00]">
            Step 1 of 3
          </p>
          
          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-[#C24E00] sm:text-4xl">
            Connect your store
          </h1>
          
          <p className="mt-4 text-lg text-[#4A4A4A]">
            Choose how you&apos;d like to connect your business to Merchant Bridge
          </p>
        </div>

        {/* Choice Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {/* Shopify Option */}
          <button
            onClick={handleShopifyConnect}
            disabled={loading}
            className="group relative flex flex-col rounded-2xl border-2 border-[#EADFD5] bg-white p-8 text-left transition hover:border-[#FF6A00] disabled:opacity-50"
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#FF6A00]/10">
              <svg className="size-6 text-[#FF6A00]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            
            <h2 className="font-display text-xl font-semibold text-[#C24E00]">
              Shopify
            </h2>
            
            <p className="mt-2 text-sm text-[#4A4A4A]">
              Connect via OAuth to automatically import your store data, products, and order history
            </p>
            
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#FF6A00]">
              {loading ? (
                <span>Connecting...</span>
              ) : (
                <>
                  <span>Connect with Shopify</span>
                  <svg className="size-4 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </div>
          </button>

          {/* Manual Option */}
          <Link
            href="/merchant/onboarding/manual"
            className="group relative flex flex-col rounded-2xl border-2 border-[#EADFD5] bg-white p-8 text-left transition hover:border-[#FF6A00]"
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#FF6A00]/10">
              <svg className="size-6 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <h2 className="font-display text-xl font-semibold text-[#C24E00]">
              Manual setup
            </h2>
            
            <p className="mt-2 text-sm text-[#4A4A4A]">
              For Etsy, WooCommerce, standalone websites, or other platforms
            </p>
            
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#FF6A00]">
              <span>Fill out form manually</span>
              <svg className="size-4 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/merchant/apply"
            className="text-sm font-semibold text-[#4A4A4A] hover:text-[#FF6A00]"
          >
            ← Back
          </Link>
        </div>
      </main>
    </div>
  );
}
