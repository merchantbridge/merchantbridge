'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function MerchantDetailPage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [internalNotes, setInternalNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileData, appsData, notesData] = await Promise.all([
      supabase
        .from('marketplace_merchant_profiles')
        .select('*')
        .eq('id', params.id)
        .single(),
      supabase
        .from('marketplace_applications')
        .select('*, marketplace_opportunities(*)')
        .eq('merchant_id', params.id)
        .order('applied_at', { ascending: false }),
      supabase
        .from('marketplace_internal_notes')
        .select('*')
        .eq('merchant_id', params.id)
        .order('created_at', { ascending: false }),
    ]);

    setProfile(profileData);
    setApplications(appsData || []);
    setInternalNotes(notesData || []);
    setLoading(false);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const response = await fetch(`/api/admin/merchants/${params.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: newNote }),
    });

    if (response.ok) {
      setNewNote('');
      loadData();
    } else {
      alert('Failed to add note');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Profile not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <a href="/admin/merchants" className="text-sm text-slate-600 hover:text-slate-700 mb-1 block">
                ← Back to Merchants
              </a>
              <h1 className="text-2xl font-bold text-slate-900">{profile.business_name}</h1>
              <p className="text-slate-600">{profile.full_name}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                profile.profile_status === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : profile.profile_status === 'pending'
                  ? 'bg-amber-100 text-amber-700'
                  : profile.profile_status === 'resubmit_requested'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {profile.profile_status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile Details</h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-500">Business Name</p>
                  <p className="text-slate-900">{profile.business_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Product Category</p>
                  <p className="text-slate-900">{profile.product_category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Store URL</p>
                  <a
                    href={profile.store_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    {profile.store_url}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Store Type</p>
                  <p className="text-slate-900">{profile.store_type || 'Manual'}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500">Business Description</p>
                <p className="text-slate-900 mt-1">{profile.business_description}</p>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500">Target Market</p>
                <p className="text-slate-900 mt-1">{profile.target_market || 'Not specified'}</p>
              </div>
            </div>

            {/* Capacity & Shipping */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Capacity & Shipping</h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-500">Average Order Value</p>
                  <p className="text-slate-900">{profile.average_order_value || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Monthly Order Volume</p>
                  <p className="text-slate-900">{profile.monthly_order_volume || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Monthly Revenue Range</p>
                  <p className="text-slate-900">{profile.monthly_revenue_range || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Custom Branding</p>
                  <p className="text-slate-900">{profile.can_custom_branding ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500 mb-2">Shipping Markets</p>
                <div className="flex flex-wrap gap-2">
                  {profile.shipping_markets?.map((market: string) => (
                    <span key={market} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                      {market}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500 mb-2">Sales Channels</p>
                <div className="flex flex-wrap gap-2">
                  {profile.sales_channels?.map((channel: string) => (
                    <span key={channel} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Application History */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Application History</h2>
              
              {applications && applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.map((app: any) => (
                    <div key={app.id} className="border-b border-slate-100 pb-3 last:border-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900">
                            {(app.marketplace_opportunities as any)?.title || 'Unknown Opportunity'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {(app.marketplace_opportunities as any)?.opportunity_type || 'N/A'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          app.application_status === 'deal_closed'
                            ? 'bg-green-100 text-green-700'
                            : app.application_status === 'in_conversation'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {app.application_status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Applied: {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                      {app.notes && (
                        <p className="text-sm text-slate-600 mt-2">Notes: {app.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No applications yet</p>
              )}
            </div>
          </div>

          {/* Right Column: Actions & Notes */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Actions</h2>
              
              <div className="space-y-3">
                {profile.profile_status === 'pending' && (
                  <>
                    <button
                      onClick={async () => {
                        const response = await fetch(`/api/admin/review-queue/${profile.id}/approve`, {
                          method: 'POST',
                        });
                        if (response.ok) loadData();
                      }}
                      className="w-full px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
                    >
                      Approve Profile
                    </button>
                    <button
                      onClick={async () => {
                        const feedback = prompt('Enter feedback for resubmission:');
                        if (feedback) {
                          const response = await fetch(`/api/admin/review-queue/${profile.id}/resubmit`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ feedback }),
                          });
                          if (response.ok) loadData();
                        }
                      }}
                      className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                    >
                      Request Resubmission
                    </button>
                  </>
                )}
                <button className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition">
                  Send Message
                </button>
                <button className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition">
                  Flag for Upsell
                </button>
                <button className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition">
                  Manual Match
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Metrics</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Opportunities Matched</span>
                  <span className="text-sm font-medium text-slate-900">{profile.opportunities_matched || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Applications Submitted</span>
                  <span className="text-sm font-medium text-slate-900">{profile.applications_submitted || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Deals Closed</span>
                  <span className="text-sm font-medium text-slate-900">{profile.deals_closed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Profile Completion</span>
                  <span className="text-sm font-medium text-slate-900">{profile.profile_completion_percentage || 0}%</span>
                </div>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Internal Notes</h2>
              
              <div className="space-y-3 mb-4">
                {internalNotes && internalNotes.length > 0 ? (
                  internalNotes.map((note: any) => (
                    <div key={note.id} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-900">{note.note}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No internal notes</p>
                )}
              </div>

              <form onSubmit={handleAddNote}>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  placeholder="Add internal note..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none mb-2"
                  required
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition text-sm"
                >
                  Add Note
                </button>
              </form>
            </div>

            {/* Supplier Document */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Supplier Document</h2>
              
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  profile.supplier_document_status === 'uploaded'
                    ? 'bg-green-100 text-green-700'
                    : profile.supplier_document_status === 'under_preparation'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {profile.supplier_document_status.replace(/_/g, ' ')}
                </span>
                {profile.supplier_document_status === 'uploaded' && (
                  <button className="text-sm text-indigo-600 hover:text-indigo-700">
                    Download
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
