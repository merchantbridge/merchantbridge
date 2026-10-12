'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function MerchantProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    productCategory: '',
    businessDescription: '',
    targetMarket: '',
    averageOrderValue: '',
    monthlyOrderVolume: '',
    canCustomBranding: false,
    shippingMarkets: [] as string[],
    monthlyRevenueRange: '',
    salesChannels: [] as string[],
    storeUrl: '',
  });

  const productCategories = [
    'Skincare', 'Apparel', 'Jewelry', 'Candles', 'Home goods', 'Food and beverage', 'Pet products', 'Other',
  ];

  const shippingOptions = ['US', 'UK', 'Europe', 'Australia', 'Canada', 'Worldwide'];
  const salesChannelOptions = ['Own website', 'Shopify', 'Etsy', 'Amazon', 'Wholesale', 'Retail', 'Other'];
  const revenueRanges = ['Under $1k', '1k-5k', '5k-10k', '10k-50k', '$50k+'];
  const orderVolumeRanges = ['Under 50', '50-100', '100-500', '500-1000', '1000+'];
  const aovRanges = ['Under $25', '$25-50', '$50-100', '$100-250', '$250+'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase
      .from('marketplace_merchant_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setFormData({
        fullName: profileData.full_name || '',
        businessName: profileData.business_name || '',
        productCategory: profileData.product_category || '',
        businessDescription: profileData.business_description || '',
        targetMarket: profileData.target_market || '',
        averageOrderValue: profileData.average_order_value || '',
        monthlyOrderVolume: profileData.monthly_order_volume || '',
        canCustomBranding: profileData.can_custom_branding || false,
        shippingMarkets: profileData.shipping_markets || [],
        monthlyRevenueRange: profileData.monthly_revenue_range || '',
        salesChannels: profileData.sales_channels || [],
        storeUrl: profileData.store_url || '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase
      .from('marketplace_merchant_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profileData) return;

    // Calculate completion percentage — trade deck is required for 100%
    const requiredFields = [
      formData.fullName,
      formData.businessName,
      formData.productCategory,
      formData.businessDescription,
      formData.storeUrl,
      profile.has_trade_deck,
    ];
    const completedFields = requiredFields.filter(Boolean).length;
    const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);

    const { error } = await supabase
      .from('marketplace_merchant_profiles')
      .update({
        full_name: formData.fullName,
        business_name: formData.businessName,
        product_category: formData.productCategory,
        business_description: formData.businessDescription,
        target_market: formData.targetMarket,
        average_order_value: formData.averageOrderValue,
        monthly_order_volume: formData.monthlyOrderVolume,
        can_custom_branding: formData.canCustomBranding,
        shipping_markets: formData.shippingMarkets,
        monthly_revenue_range: formData.monthlyRevenueRange,
        sales_channels: formData.salesChannels,
        store_url: formData.storeUrl,
        profile_completion_percentage: completionPercentage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileData.id);

    if (error) {
      alert('Failed to update profile');
    } else {
      setProfile({ ...profile, ...formData, profile_completion_percentage: completionPercentage });
      setEditMode(false);
    }
    setSaving(false);
  };

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

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Merchant Profile</h1>
            <div className="flex items-center gap-4">
              <a href="/merchant/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-700">
                Back to Dashboard
              </a>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Completion */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Profile Completion: {profile?.profile_completion_percentage || 0}%
            </span>
            <span className="text-xs text-slate-500">
              {profile?.profile_completion_percentage < 100
                ? 'Complete your profile for better opportunity matches'
                : 'Great job! Your profile is complete.'}
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all"
              style={{ width: `${profile?.profile_completion_percentage || 0}%` }}
            />
          </div>
        </div>

        {editMode ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Edit Your Profile</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Business Name</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Product Category</label>
              <select
                value={formData.productCategory}
                onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              >
                {productCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Business Description</label>
              <textarea
                rows={4}
                maxLength={1500}
                value={formData.businessDescription}
                onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.businessDescription.split(/\s+/).filter(Boolean).length} / 150 words
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Market</label>
              <input
                type="text"
                value={formData.targetMarket}
                onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Average Order Value</label>
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Order Volume</label>
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Shipping Markets</label>
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Revenue Range</label>
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Sales Channels</label>
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Store URL</label>
              <input
                type="url"
                value={formData.storeUrl}
                onChange={(e) => setFormData({ ...formData, storeUrl: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Profile Details</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                <p className="text-slate-900">{profile?.full_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Business Name</label>
                <p className="text-slate-900">{profile?.business_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Product Category</label>
                <p className="text-slate-900">{profile?.product_category}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Store URL</label>
                <a
                  href={profile?.store_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  {profile?.store_url}
                </a>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Business Description</label>
              <p className="text-slate-900">{profile?.business_description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Target Market</label>
              <p className="text-slate-900">{profile?.target_market || 'Not specified'}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Average Order Value</label>
                <p className="text-slate-900">{profile?.average_order_value || 'Not specified'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Monthly Order Volume</label>
                <p className="text-slate-900">{profile?.monthly_order_volume || 'Not specified'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Custom Branding</label>
              <p className="text-slate-900">{profile?.can_custom_branding ? 'Yes' : 'No'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Shipping Markets</label>
              <div className="flex flex-wrap gap-2">
                {profile?.shipping_markets?.map((market: string) => (
                  <span key={market} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                    {market}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Monthly Revenue Range</label>
              <p className="text-slate-900">{profile?.monthly_revenue_range || 'Not specified'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Sales Channels</label>
              <div className="flex flex-wrap gap-2">
                {profile?.sales_channels?.map((channel: string) => (
                  <span key={channel} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                    {channel}
                  </span>
                ))}
              </div>
            </div>

            {/* Supplier Document Section */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Supplier Document</h3>
              
              {profile?.supplier_document_status === 'not_uploaded' ? (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-slate-600 mb-3">
                    You don't have a supplier profile document on file. Having one can help us better understand your business.
                  </p>
                  <a
                    href="mailto:support@demerchantbridge.com"
                    className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                  >
                    Contact our specialist to get started
                  </a>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium mb-2">
                    {profile.supplier_document_status === 'approved' ? 'Document Approved' : 'Document Under Review'}
                  </p>
                  <p className="text-green-700 text-sm">
                    Status: {profile.supplier_document_status}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
