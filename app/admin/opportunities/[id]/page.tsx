'use client';
import Link from 'next/link';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function EditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    opportunity_type: '',
    short_description: '',
    key_requirements: [] as string[],
    source_url: '',
    source_type: '',
    matching_categories: [] as string[],
    matching_capacity_ranges: [] as string[],
    matching_shipping_markets: [] as string[],
    require_custom_branding: false,
    expiry_date: '',
    priority_level: 'standard',
  });

  const opportunityTypes = ['Corporate Gifting', 'Wholesale', 'Brand Partnership', 'UGC Campaign', 'Retail Listing', 'Product Sourcing'];
  const sourceTypes = ['LinkedIn', 'Industry publication', 'Platform outreach', 'Direct brand contact', 'Other'];
  const categories = ['Skincare', 'Apparel', 'Jewelry', 'Candles', 'Home goods', 'Food and beverage', 'Pet products', 'Other'];
  const capacityRanges = ['Under $25', '$25-50', '$50-100', '$100-250', '$250+'];
  const shippingMarkets = ['US', 'UK', 'Europe', 'Australia', 'Canada', 'Worldwide'];

  const loadOpportunity = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('marketplace_opportunities')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setFormData({
        title: data.title || '',
        opportunity_type: data.opportunity_type || '',
        short_description: data.short_description || '',
        key_requirements: data.key_requirements || [],
        source_url: data.source_url || '',
        source_type: data.source_type || '',
        matching_categories: data.matching_categories || [],
        matching_capacity_ranges: data.matching_capacity_ranges || [],
        matching_shipping_markets: data.matching_shipping_markets || [],
        require_custom_branding: data.require_custom_branding || false,
        expiry_date: data.expiry_date ? data.expiry_date.split('T')[0] : '',
        priority_level: data.priority_level || 'standard',
      });
    }
    setLoading(false);
  };


  useEffect(() => {
    loadOpportunity();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const response = await fetch(`/api/admin/opportunities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      router.push('/admin/opportunities');
    } else {
      alert('Failed to update opportunity');
      setSaving(false);
    }
  };

  const toggleArrayItem = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value],
    }));
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/admin/opportunities" className="text-sm text-slate-600 hover:text-slate-700 mb-1 block">
            ← Back to Opportunities
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Edit Opportunity</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Opportunity Type *</label>
            <select
              value={formData.opportunity_type}
              onChange={(e) => setFormData({ ...formData, opportunity_type: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              required
            >
              <option value="">Select type</option>
              {opportunityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Short Description *</label>
            <textarea
              rows={3}
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Key Requirements</label>
            <input
              type="text"
              placeholder="Enter requirement and press Enter"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none mb-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const target = e.target as HTMLInputElement;
                  if (target.value.trim()) {
                    setFormData({ ...formData, key_requirements: [...formData.key_requirements, target.value.trim()] });
                    target.value = '';
                  }
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {formData.key_requirements.map((req, index) => (
                <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-2">
                  {req}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, key_requirements: formData.key_requirements.filter((_, i) => i !== index) })}
                    className="text-indigo-500 hover:text-indigo-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Source URL *</label>
            <input
              type="url"
              value={formData.source_url}
              onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Source Type *</label>
            <select
              value={formData.source_type}
              onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              required
            >
              <option value="">Select source</option>
              {sourceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Matching Categories</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleArrayItem('matching_categories', cat)}
                  className={`px-4 py-3 rounded-lg border-2 transition text-sm ${
                    formData.matching_categories.includes(cat)
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Matching Capacity Ranges</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {capacityRanges.map(range => (
                <button
                  key={range}
                  type="button"
                  onClick={() => toggleArrayItem('matching_capacity_ranges', range)}
                  className={`px-4 py-3 rounded-lg border-2 transition text-sm ${
                    formData.matching_capacity_ranges.includes(range)
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Matching Shipping Markets</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {shippingMarkets.map(market => (
                <button
                  key={market}
                  type="button"
                  onClick={() => toggleArrayItem('matching_shipping_markets', market)}
                  className={`px-4 py-3 rounded-lg border-2 transition text-sm ${
                    formData.matching_shipping_markets.includes(market)
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {market}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="customBranding"
              checked={formData.require_custom_branding}
              onChange={(e) => setFormData({ ...formData, require_custom_branding: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="customBranding" className="text-sm font-medium text-slate-700">
              Require custom branding capability
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date</label>
            <input
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Priority Level</label>
            <select
              value={formData.priority_level}
              onChange={(e) => setFormData({ ...formData, priority_level: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
            >
              <option value="standard">Standard</option>
              <option value="featured">Featured</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
