'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MerchantOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [storeType, setStoreType] = useState<'shopify' | 'manual'>('manual');
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    fullName: '',
    businessName: '',
    productCategory: '',
    businessDescription: '',
    targetMarket: '',
    
    // Step 2: Capacity
    averageOrderValue: '',
    monthlyOrderVolume: '',
    canCustomBranding: false,
    
    // Step 3: Shipping
    shippingMarkets: [] as string[],
    
    // Step 4: Revenue
    monthlyRevenueRange: '',
    
    // Step 5: Sales Channels
    salesChannels: [] as string[],
    
    // Step 6: Store Info (manual)
    storeUrl: '',
    
    // Step 7: Document
    supplierDocument: null as File | null,
  });

  const productCategories = [
    'Skincare',
    'Apparel',
    'Jewelry',
    'Candles',
    'Home goods',
    'Food and beverage',
    'Pet products',
    'Other',
  ];

  const shippingOptions = ['US', 'UK', 'Europe', 'Australia', 'Canada', 'Worldwide'];
  
  const salesChannelOptions = [
    'Own website',
    'Shopify',
    'Etsy',
    'Amazon',
    'Wholesale',
    'Retail',
    'Other',
  ];

  const revenueRanges = [
    'Under $1k',
    '1k-5k',
    '5k-10k',
    '10k-50k',
    '$50k+',
  ];

  const orderVolumeRanges = [
    'Under 50',
    '50-100',
    '100-500',
    '500-1000',
    '1000+',
  ];

  const aovRanges = [
    'Under $25',
    '$25-50',
    '$50-100',
    '$100-250',
    '$250+',
  ];

  const handleToggleShipping = (market: string) => {
    setFormData(prev => ({
      ...prev,
      shippingMarkets: prev.shippingMarkets.includes(market)
        ? prev.shippingMarkets.filter(m => m !== market)
        : [...prev.shippingMarkets, market],
    }));
  };

  const handleToggleSalesChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      salesChannels: prev.salesChannels.includes(channel)
        ? prev.salesChannels.filter(c => c !== channel)
        : [...prev.salesChannels, channel],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/merchant/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          storeType,
        }),
      });

      if (response.ok) {
        router.push('/merchant/onboarding/success');
      } else {
        const error = await response.json();
        alert(error.message || 'Something went wrong');
      }
    } catch (error) {
      alert('Failed to submit application');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Step 1: About You</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Category *
              </label>
              <select
                required
                value={formData.productCategory}
                onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Select a category</option>
                {productCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Business Description (max 150 words) *
              </label>
              <textarea
                required
                rows={4}
                maxLength={1500}
                value={formData.businessDescription}
                onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                placeholder="Tell us about your business..."
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.businessDescription.split(/\s+/).filter(Boolean).length} / 150 words
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Market
              </label>
              <input
                type="text"
                value={formData.targetMarket}
                onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                placeholder="Who are your customers?"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Step 2: Capacity</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Average Order Value
              </label>
              <select
                value={formData.averageOrderValue}
                onChange={(e) => setFormData({ ...formData, averageOrderValue: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Select range</option>
                {aovRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monthly Order Volume (approximate)
              </label>
              <select
                value={formData.monthlyOrderVolume}
                onChange={(e) => setFormData({ ...formData, monthlyOrderVolume: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Select range</option>
                {orderVolumeRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="customBranding"
                checked={formData.canCustomBranding}
                onChange={(e) => setFormData({ ...formData, canCustomBranding: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="customBranding" className="text-sm font-medium text-slate-700">
                Can you do custom branding or packaging?
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Step 3: Shipping</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Which markets do you ship to? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {shippingOptions.map(market => (
                  <button
                    key={market}
                    type="button"
                    onClick={() => handleToggleShipping(market)}
                    className={`px-4 py-3 rounded-lg border-2 transition ${
                      formData.shippingMarkets.includes(market)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {market}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Step 4: Revenue</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Monthly Revenue Range
              </label>
              <select
                value={formData.monthlyRevenueRange}
                onChange={(e) => setFormData({ ...formData, monthlyRevenueRange: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Select range</option>
                {revenueRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Step 5: Sales Channels</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                How do you currently sell? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {salesChannelOptions.map(channel => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => handleToggleSalesChannel(channel)}
                    className={`px-4 py-3 rounded-lg border-2 transition ${
                      formData.salesChannels.includes(channel)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Step 6: Store Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Store URL *
              </label>
              <input
                type="url"
                required
                value={formData.storeUrl}
                onChange={(e) => setFormData({ ...formData, storeUrl: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                placeholder="https://yourstore.com"
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Step 7: Supplier Document (Optional)</h2>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <p className="text-sm text-slate-600 mb-4">
                If you have an existing supplier profile document, you can upload it here. This helps us better understand your business.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Document
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFormData({ ...formData, supplierDocument: e.target.files?.[0] || null })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            ← Back to Merchant Bridge
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Apply for Access</h1>
            <p className="text-slate-600 mt-2">
              Tell us about your business so we can match you with the right opportunities.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Step {step} of 7</span>
              <span className="text-sm text-slate-500">{Math.round((step / 7) * 100)}% complete</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${(step / 7) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {renderStep()}

            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}

              {step < 7 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                >
                  Submit Application
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
