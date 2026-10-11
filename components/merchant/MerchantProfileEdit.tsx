"use client";

import { useState } from "react";
import Link from "next/link";
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

interface Merchant {
  id: string;
  business_name: string;
  business_email: string;
  phone: string;
  country: string;
  location: string;
  store_url: string;
  product_category: string;
  business_description: string;
  target_market: string;
  average_order_value: string;
  monthly_order_volume: string;
  custom_branding_packaging: boolean;
  shipping_markets: string[];
  current_monthly_revenue: string;
  current_sales_channels: string[];
  supplier_profile_document_url: string;
  supplier_profile_document_status: string;
}

interface MerchantProfileEditProps {
  merchant: Merchant;
  fullName: string;
}

export default function MerchantProfileEdit({
  merchant,
  fullName,
}: MerchantProfileEditProps) {
  const supabase = createClient();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName,
    businessName: merchant.business_name,
    businessEmail: merchant.business_email,
    phone: merchant.phone || "",
    country: merchant.country,
    location: merchant.location || "",
    storeUrl: merchant.store_url || "",
    productCategory: merchant.product_category || "",
    businessDescription: merchant.business_description || "",
    targetMarket: merchant.target_market || "",
    averageOrderValue: merchant.average_order_value || "",
    monthlyOrderVolume: merchant.monthly_order_volume || "",
    customBrandingPackaging: merchant.custom_branding_packaging,
    shippingMarkets: merchant.shipping_markets || [],
    currentMonthlyRevenue: merchant.current_monthly_revenue || "",
    salesChannels: merchant.current_sales_channels || [],
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

  async function saveProfile() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      // Check if key fields changed
      const keyFieldsChanged =
        form.productCategory !== merchant.product_category ||
        form.monthlyOrderVolume !== merchant.monthly_order_volume ||
        form.currentMonthlyRevenue !== merchant.current_monthly_revenue;

      // Update profile name
      await supabase
        .from("profiles")
        .update({ full_name: form.fullName })
        .eq("id", (await supabase.auth.getUser()).data.user?.id);

      // Update merchant profile
      const { error } = await supabase
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
        .eq("id", merchant.id);

      if (error) throw error;

      setMessage("Profile updated successfully");

      if (keyFieldsChanged) {
        setMessage(
          "Profile updated. Our team has been notified and will review your matching preferences."
        );
      }

      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-[#F3F5F2]">
        <header className="border-b border-[#EADFD5] bg-white">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <Link href="/merchant/dashboard" className="font-display text-xl font-semibold text-[#C24E00]">
              ← Back to dashboard
            </Link>
            <h1 className="font-display text-xl font-semibold text-[#C24E00]">
              Edit Profile
            </h1>
            <div className="flex size-10 items-center justify-center rounded-full bg-[#FF6A00] text-sm font-semibold text-white">
              {form.businessName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-8">
          {message && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); saveProfile(); }} className="space-y-8">
            {/* Similar to manual onboarding form */}
            <section className="rounded-2xl border border-[#EADFD5] bg-white p-6">
              <h2 className="font-display text-lg font-semibold text-[#C24E00]">
                Business Information
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setField("fullName", e.target.value)}
                    className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                    Business name
                  </label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => setField("businessName", e.target.value)}
                    className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                    Business email
                  </label>
                  <input
                    type="email"
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
                    Country
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
                    type="text"
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
                    className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                  />
                </div>
              </div>
            </section>

            {/* Product & Market Section */}
            <section className="rounded-2xl border border-[#EADFD5] bg-white p-6">
              <h2 className="font-display text-lg font-semibold text-[#C24E00]">
                Product & Market
              </h2>
              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                    Product category
                  </label>
                  <select
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
                    Business description
                  </label>
                  <textarea
                    rows={4}
                    value={form.businessDescription}
                    onChange={(e) => setField("businessDescription", e.target.value)}
                    className="w-full resize-none rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                    Target market
                  </label>
                  <input
                    type="text"
                    value={form.targetMarket}
                    onChange={(e) => setField("targetMarket", e.target.value)}
                    className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                  />
                </div>
              </div>
            </section>

            {/* Operations Section */}
            <section className="rounded-2xl border border-[#EADFD5] bg-white p-6">
              <h2 className="font-display text-lg font-semibold text-[#C24E00]">
                Operations
              </h2>
              <div className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                      Average order value
                    </label>
                    <input
                      type="text"
                      value={form.averageOrderValue}
                      onChange={(e) => setField("averageOrderValue", e.target.value)}
                      className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                      Monthly order volume
                    </label>
                    <select
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
                    Current monthly revenue
                  </label>
                  <select
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
                    Shipping markets (select all that apply)
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
                    How you currently sell (select all that apply)
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

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#FF6A00] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#E85D00] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="rounded-xl border border-[#EADFD5] px-6 py-3.5 text-sm font-semibold text-[#C24E00] transition hover:border-[#FF6A00] hover:text-[#FF6A00] disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F5F2]">
      <header className="border-b border-[#EADFD5] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/merchant/dashboard" className="font-display text-xl font-semibold text-[#C24E00]">
            ← Back to dashboard
          </Link>
          <h1 className="font-display text-xl font-semibold text-[#C24E00]">
            Your Profile
          </h1>
          <div className="flex size-10 items-center justify-center rounded-full bg-[#FF6A00] text-sm font-semibold text-white">
            {form.businessName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}

        <div className="rounded-2xl border border-[#EADFD5] bg-white p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-semibold text-[#C24E00]">
              {form.businessName}
            </h2>
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-xl border border-[#EADFD5] px-4 py-2 text-sm font-semibold text-[#C24E00] transition hover:border-[#FF6A00] hover:text-[#FF6A00]"
            >
              Edit profile
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#4A4A4A]">
                Contact
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-[#C24E00]">{form.businessEmail}</p>
                {form.phone && <p className="text-[#C24E00]">{form.phone}</p>}
                <p className="text-[#C24E00]">{form.country}</p>
                {form.location && <p className="text-[#C24E00]">{form.location}</p>}
              </div>
            </div>

            {form.storeUrl && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#4A4A4A]">
                  Store
                </p>
                <a
                  href={form.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-[#FF6A00] hover:underline"
                >
                  {form.storeUrl}
                </a>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#4A4A4A]">
                Product
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-[#C24E00]">{form.productCategory}</p>
                <p className="text-[#4A4A4A]">{form.businessDescription}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#4A4A4A]">
                Target Market
              </p>
              <p className="mt-2 text-[#C24E00]">{form.targetMarket}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#4A4A4A]">
                Operations
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div>
                  <span className="text-[#4A4A4A]">Average order value:</span>
                  <span className="ml-2 text-[#C24E00]">{form.averageOrderValue}</span>
                </div>
                <div>
                  <span className="text-[#4A4A4A]">Monthly volume:</span>
                  <span className="ml-2 text-[#C24E00]">{form.monthlyOrderVolume}</span>
                </div>
                <div>
                  <span className="text-[#4A4A4A]">Revenue:</span>
                  <span className="ml-2 text-[#C24E00]">{form.currentMonthlyRevenue}</span>
                </div>
                <div>
                  <span className="text-[#4A4A4A]">Custom branding:</span>
                  <span className="ml-2 text-[#C24E00]">
                    {form.customBrandingPackaging ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#4A4A4A]">
                Shipping Markets
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.shippingMarkets.map((market) => (
                  <span
                    key={market}
                    className="rounded-full bg-[#FF6A00]/10 px-3 py-1 text-sm font-semibold text-[#FF6A00]"
                  >
                    {market}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#4A4A4A]">
                Sales Channels
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.salesChannels.map((channel) => (
                  <span
                    key={channel}
                    className="rounded-full bg-[#FF6A00]/10 px-3 py-1 text-sm font-semibold text-[#FF6A00]"
                  >
                    {channel}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#4A4A4A]">
                Supplier Profile Document
              </p>
              <div className="mt-2">
                {merchant.supplier_profile_document_status === "uploaded_and_approved" ? (
                  <div className="flex items-center gap-2">
                    <svg className="size-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <span className="text-[#C24E00]">Document uploaded and approved</span>
                    {merchant.supplier_profile_document_url && (
                      <a
                        href={merchant.supplier_profile_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-[#FF6A00] hover:underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#F3F5F2] p-4">
                    <p className="text-sm text-[#4A4A4A]">
                      No supplier profile document on file
                    </p>
                    <p className="mt-1 text-sm text-[#4A4A4A]">
                      Having a supplier profile document can help you stand out to buyers.{" "}
                      <a
                        href="mailto:support@demerchantbridge.com"
                        className="font-semibold text-[#FF6A00] hover:underline"
                      >
                        Contact our specialist
                      </a>{" "}
                      to get one prepared.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
