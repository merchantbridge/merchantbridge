"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CountrySelect from "@/components/shared/CountrySelect";

const PRODUCT_CATEGORIES = [
  "Skincare",
  "Apparel",
  "Jewelry",
  "Candles",
  "Home goods",
  "Food and beverage",
  "Pet products",
  "Other",
] as const;

const REVENUE_RANGES = [
  "Under $1k",
  "$1k-5k",
  "$5k-10k",
  "$10k-50k",
  "$50k+",
] as const;

const ORDER_VOLUMES = [
  "Under 50",
  "50-100",
  "100-500",
  "500-1000",
  "1000+",
] as const;

const SHIPPING_MARKETS = [
  "US",
  "UK",
  "Europe",
  "Australia",
  "Canada",
  "Worldwide",
] as const;

const SALES_CHANNELS = [
  "Own website",
  "Shopify",
  "Etsy",
  "Amazon",
  "Wholesale",
  "Retail",
  "Other",
] as const;

export default function ManualOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    businessName: "",
    businessEmail: "",
    phone: "",
    country: "United States",
    location: "",
    storeUrl: "",
    productCategory: "",
    businessDescription: "",
    targetMarket: "",
    averageOrderValue: "",
    monthlyOrderVolume: "",
    customBrandingPackaging: false,
    shippingMarkets: [] as string[],
    currentMonthlyRevenue: "",
    salesChannels: [] as string[],
    supplierProfileDocument: null as File | null,
  });

  function setField<K extends keyof typeof form>(
    field: K,
    value: typeof form[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleShippingMarket(market: string) {
    setForm((prev) => ({
      ...prev,
      shippingMarkets: prev.shippingMarkets.includes(market)
        ? prev.shippingMarkets.filter((m) => m !== market)
        : [...prev.shippingMarkets, market],
    }));
  }

  function toggleSalesChannel(channel: string) {
    setForm((prev) => ({
      ...prev,
      salesChannels: prev.salesChannels.includes(channel)
        ? prev.salesChannels.filter((c) => c !== channel)
        : [...prev.salesChannels, channel],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/sign-in");
        return;
      }

      // Validation
      if (
        !form.fullName.trim() ||
        !form.businessName.trim() ||
        !form.businessEmail.trim() ||
        !form.productCategory ||
        !form.businessDescription.trim() ||
        !form.targetMarket.trim() ||
        !form.averageOrderValue.trim() ||
        !form.monthlyOrderVolume ||
        !form.currentMonthlyRevenue ||
        form.shippingMarkets.length === 0 ||
        form.salesChannels.length === 0
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Create or update merchant profile
      const { data: merchant } = await supabase
        .from("merchant_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      let merchantId: string;

      if (merchant) {
        merchantId = merchant.id;
        const { error: updateError } = await supabase
          .from("merchant_profiles")
          .update({
            business_name: form.businessName,
            business_email: form.businessEmail,
            phone: form.phone || null,
            country: form.country,
            location: form.location || null,
            store_url: form.storeUrl || null,
            product_category: form.productCategory,
            business_description: form.businessDescription,
            target_market: form.targetMarket,
            average_order_value: form.averageOrderValue,
            monthly_order_volume: form.monthlyOrderVolume,
            custom_branding_packaging: form.customBrandingPackaging,
            shipping_markets: form.shippingMarkets,
            current_monthly_revenue: form.currentMonthlyRevenue,
            current_sales_channels: form.salesChannels,
          })
          .eq("id", merchantId);

        if (updateError) throw updateError;
      } else {
        const { data: newMerchant, error: createError } = await supabase
          .from("merchant_profiles")
          .insert({
            user_id: user.id,
            business_name: form.businessName,
            business_email: form.businessEmail,
            phone: form.phone || null,
            country: form.country,
            location: form.location || null,
            store_url: form.storeUrl || null,
            product_category: form.productCategory,
            business_description: form.businessDescription,
            target_market: form.targetMarket,
            average_order_value: form.averageOrderValue,
            monthly_order_volume: form.monthlyOrderVolume,
            custom_branding_packaging: form.customBrandingPackaging,
            shipping_markets: form.shippingMarkets,
            current_monthly_revenue: form.currentMonthlyRevenue,
            current_sales_channels: form.salesChannels,
          })
          .select("id")
          .single();

        if (createError) throw createError;
        merchantId = newMerchant.id;
      }

      // Update profile name
      await supabase
        .from("profiles")
        .update({ full_name: form.fullName })
        .eq("id", user.id);

      // Upload supplier profile document if provided
      if (form.supplierProfileDocument) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", form.supplierProfileDocument);
        formData.append("merchant_id", merchantId);

        const uploadResponse = await fetch("/api/merchant/supplier-document", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const result = await uploadResponse.json();
          throw new Error(result.error || "Document upload failed");
        }
      }

      // Create merchant application
      await supabase.from("merchant_applications").insert({
        merchant_id: merchantId,
        status: "submitted",
      });

      router.push("/merchant/onboarding/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
      setUploading(false);
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
      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <div className="mb-8">
          <Link
            href="/merchant/onboarding"
            className="text-sm font-semibold text-[#4A4A4A] hover:text-[#FF6A00]"
          >
            ← Back
          </Link>
        </div>

        <div className="mb-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-[#FF6A00]">
            Step 2 of 3
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold text-[#C24E00]">
            Tell us about your business
          </h1>
          <p className="mt-2 text-[#4A4A4A]">
            This information helps us match you with the right opportunities
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Business Information */}
          <section className="rounded-2xl border border-[#EADFD5] bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-[#C24E00]">
              Business Information
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                  Full name *
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                  Business name *
                </label>
                <input
                  type="text"
                  required
                  value={form.businessName}
                  onChange={(e) => setField("businessName", e.target.value)}
                  className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                  Business email *
                </label>
                <input
                  type="email"
                  required
                  value={form.businessEmail}
                  onChange={(e) => setField("businessEmail", e.target.value)}
                  className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                  Country *
                </label>
                <CountrySelect
                  value={form.country}
                  onChange={(value) => setField("country", value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                  Business location
                </label>
                <input
                  value={form.location}
                  onChange={(e) => setField("location", e.target.value)}
                  placeholder="City or state, e.g. Wyoming"
                  maxLength={120}
                  className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                  Store URL
                </label>
                <input
                  type="url"
                  value={form.storeUrl}
                  onChange={(e) => setField("storeUrl", e.target.value)}
                  placeholder="https://yourstore.com"
                  className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                />
              </div>
            </div>
          </section>

          {/* Product & Market */}
          <section className="rounded-2xl border border-[#EADFD5] bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-[#C24E00]">
              Product & Market
            </h2>
            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                  Product category *
                </label>
                <select
                  required
                  value={form.productCategory}
                  onChange={(e) => setField("productCategory", e.target.value)}
                  className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                >
                  <option value="">Select a category</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                  Business description * (max 150 words)
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.businessDescription}
                  onChange={(e) => setField("businessDescription", e.target.value)}
                  className="w-full resize-none rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                />
                <p className="mt-1 text-xs text-[#4A4A4A]">
                  {form.businessDescription.split(/\s+/).filter(Boolean).length} / 150 words
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                  Target market *
                </label>
                <input
                  type="text"
                  required
                  value={form.targetMarket}
                  onChange={(e) => setField("targetMarket", e.target.value)}
                  placeholder="e.g., Women 25-35 interested in wellness"
                  className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                />
              </div>
            </div>
          </section>

          {/* Operations */}
          <section className="rounded-2xl border border-[#EADFD5] bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-[#C24E00]">
              Operations
            </h2>
            <div className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                    Average order value *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.averageOrderValue}
                    onChange={(e) => setField("averageOrderValue", e.target.value)}
                    placeholder="e.g., $50"
                    className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                    Monthly order volume *
                  </label>
                  <select
                    required
                    value={form.monthlyOrderVolume}
                    onChange={(e) => setField("monthlyOrderVolume", e.target.value)}
                    className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                  >
                    <option value="">Select volume</option>
                    {ORDER_VOLUMES.map((vol) => (
                      <option key={vol} value={vol}>
                        {vol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                  Current monthly revenue *
                </label>
                <select
                  required
                  value={form.currentMonthlyRevenue}
                  onChange={(e) => setField("currentMonthlyRevenue", e.target.value)}
                  className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                >
                  <option value="">Select revenue range</option>
                  {REVENUE_RANGES.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                  Shipping markets * (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {SHIPPING_MARKETS.map((market) => (
                    <label
                      key={market}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#EADFD5] px-3 py-2 text-sm transition hover:border-[#FF6A00]"
                    >
                      <input
                        type="checkbox"
                        checked={form.shippingMarkets.includes(market)}
                        onChange={() => toggleShippingMarket(market)}
                        className="size-4 rounded border-[#EADFD5] text-[#FF6A00] focus:ring-[#FF6A00]"
                      />
                      {market}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                  How you currently sell * (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {SALES_CHANNELS.map((channel) => (
                    <label
                      key={channel}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#EADFD5] px-3 py-2 text-sm transition hover:border-[#FF6A00]"
                    >
                      <input
                        type="checkbox"
                        checked={form.salesChannels.includes(channel)}
                        onChange={() => toggleSalesChannel(channel)}
                        className="size-4 rounded border-[#EADFD5] text-[#FF6A00] focus:ring-[#FF6A00]"
                      />
                      {channel}
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.customBrandingPackaging}
                  onChange={(e) =>
                    setField("customBrandingPackaging", e.target.checked)
                  }
                  className="size-4 rounded border-[#EADFD5] text-[#FF6A00] focus:ring-[#FF6A00]"
                />
                <span className="text-sm font-semibold text-[#C24E00]">
                  Can you do custom branding or packaging?
                </span>
              </label>
            </div>
          </section>

          {/* Supplier Document */}
          <section className="rounded-2xl border border-[#EADFD5] bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-[#C24E00]">
              Supplier Profile Document
            </h2>
            <p className="mt-2 text-sm text-[#4A4A4A]">
              If you have an existing supplier profile document, upload it here
            </p>
            <div className="mt-4">
              <label className="cursor-pointer rounded-xl border border-dashed border-[#FF6A00] px-4 py-3 text-sm font-semibold text-[#FF6A00] inline-block">
                {uploading ? "Uploading..." : "Upload document"}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  disabled={uploading}
                  className="sr-only"
                  onChange={(e) => {
                    setField(
                      "supplierProfileDocument",
                      e.target.files?.[0] || null
                    );
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              {form.supplierProfileDocument && (
                <span className="ml-3 text-sm text-[#4A4A4A]">
                  {form.supplierProfileDocument.name}
                </span>
              )}
            </div>
          </section>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || uploading}
              className="min-w-[170px] rounded-xl bg-[#FF6A00] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#E85D00] disabled:opacity-60"
            >
              {loading || uploading ? "Submitting..." : "Submit application"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
