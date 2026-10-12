'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function MerchantOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<Set<string>>(new Set());
  const [appliedOpportunities, setAppliedOpportunities] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadOpportunities = async () => {
    const supabase = createClient();
    
    // Get merchant profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('marketplace_merchant_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile) return;

    // Get matched opportunities
    const { data: opps } = await supabase
      .from('marketplace_opportunities')
      .select('*')
      .eq('status', 'live')
      .contains('matching_categories', [profile.product_category])
      .order('added_at', { ascending: false });

    setOpportunities(opps || []);

    // Get saved opportunities
    const { data: saved } = await supabase
      .from('marketplace_saved_opportunities')
      .select('opportunity_id')
      .eq('merchant_id', profile.id);

    setSavedOpportunities(new Set(saved?.map(s => s.opportunity_id) || []));

    // Get applied opportunities
    const { data: applied } = await supabase
      .from('marketplace_applications')
      .select('opportunity_id')
      .eq('merchant_id', profile.id);

    setAppliedOpportunities(new Set(applied?.map(a => a.opportunity_id) || []));

    setLoading(false);
  };


  useEffect(() => {
    loadOpportunities();
  }, []);

  const handleSave = async (opportunityId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('marketplace_merchant_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) return;

    if (savedOpportunities.has(opportunityId)) {
      await supabase
        .from('marketplace_saved_opportunities')
        .delete()
        .eq('merchant_id', profile.id)
        .eq('opportunity_id', opportunityId);
      
      setSavedOpportunities(prev => {
        const next = new Set(prev);
        next.delete(opportunityId);
        return next;
      });
    } else {
      await supabase
        .from('marketplace_saved_opportunities')
        .insert({ merchant_id: profile.id, opportunity_id: opportunityId });
      
      setSavedOpportunities(prev => new Set(prev).add(opportunityId));
    }
  };

  const handleApplied = async (opportunityId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('marketplace_merchant_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) return;

    if (!appliedOpportunities.has(opportunityId)) {
      await supabase
        .from('marketplace_applications')
        .insert({ merchant_id: profile.id, opportunity_id: opportunityId });
      
      setAppliedOpportunities(prev => new Set(prev).add(opportunityId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading opportunities...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Opportunities</h1>
          <p className="text-slate-600">Opportunities matched to your profile</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {opportunities.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              No opportunities yet
            </h2>
            <p className="text-slate-600 mb-4">
              We&apos;re actively sourcing opportunities in your category. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {opportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="bg-white rounded-xl border border-slate-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {opportunity.opportunity_type}
                    </span>
                    <h2 className="text-xl font-semibold text-slate-900 mt-2">
                      {opportunity.title}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(opportunity.added_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-slate-600 mb-4">
                  {opportunity.short_description}
                </p>

                {opportunity.key_requirements && opportunity.key_requirements.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-slate-900 mb-2">Key Requirements:</h3>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                      {opportunity.key_requirements.map((req: string, idx: number) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <a
                    href={opportunity.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                  >
                    View Opportunity
                  </a>

                  <button
                    onClick={() => handleSave(opportunity.id)}
                    className={`px-4 py-2 rounded-lg border font-medium transition ${
                      savedOpportunities.has(opportunity.id)
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {savedOpportunities.has(opportunity.id) ? 'Saved' : 'Save'}
                  </button>

                  {!appliedOpportunities.has(opportunity.id) && (
                    <button
                      onClick={() => handleApplied(opportunity.id)}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                    >
                      I Applied
                    </button>
                  )}

                  {appliedOpportunities.has(opportunity.id) && (
                    <span className="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium">
                      Applied ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
