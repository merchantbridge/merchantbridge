'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function MerchantApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [testimonialText, setTestimonialText] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('marketplace_merchant_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) return;

    const { data: apps } = await supabase
      .from('marketplace_applications')
      .select('*, marketplace_opportunities(*)')
      .eq('merchant_id', profile.id)
      .order('applied_at', { ascending: false });

    setApplications(apps || []);
    setLoading(false);
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    const res = await fetch(`/api/merchant/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      alert('Failed to update status');
    } else {
      loadApplications();

      if (newStatus === 'deal_closed') {
        const app = applications.find(a => a.id === applicationId);
        setSelectedApplication(app);
        setShowTestimonialModal(true);
      }
    }
  };

  const handleNotesUpdate = async (applicationId: string, notes: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('marketplace_applications')
      .update({ notes })
      .eq('id', applicationId);

    if (error) {
      alert('Failed to update notes');
    } else {
      loadApplications();
    }
  };

  const handleTestimonialSubmit = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !selectedApplication) return;

    const { data: profile } = await supabase
      .from('marketplace_merchant_profiles')
      .select('id, business_name')
      .eq('user_id', user.id)
      .single();

    if (!profile) return;

    const { error } = await supabase
      .from('marketplace_testimonials')
      .insert({
        merchant_id: profile.id,
        merchant_display_name: profile.full_name || profile.business_name,
        service_or_opportunity: (selectedApplication.marketplace_opportunities as any)?.title || 'Opportunity',
        testimonial_text: testimonialText,
        status: 'pending',
      });

    if (error) {
      alert('Failed to submit testimonial');
    } else {
      await supabase
        .from('marketplace_applications')
        .update({ testimonial_submitted: true, testimonial_text })
        .eq('id', selectedApplication.id);
      
      setShowTestimonialModal(false);
      setTestimonialText('');
      setSelectedApplication(null);
      alert('Thank you for sharing your testimonial!');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Your Applications</h1>
          <p className="text-slate-600">Track your opportunity applications</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {applications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No applications yet</h2>
            <p className="text-slate-600 mb-4">
              Start applying to opportunities to track them here.
            </p>
            <a
              href="/merchant/opportunities"
              className="inline-block px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              Browse Opportunities
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Opportunity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date Applied</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Notes</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-slate-200">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {(app.marketplace_opportunities as any)?.title || 'Unknown Opportunity'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {(app.marketplace_opportunities as any)?.opportunity_type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={app.application_status}
                        onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                        className="text-sm rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="applied">Applied</option>
                        <option value="in_conversation">In Conversation</option>
                        <option value="deal_closed">Deal Closed</option>
                        <option value="not_successful">Not Successful</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <textarea
                        rows={2}
                        value={app.notes || ''}
                        onChange={(e) => handleNotesUpdate(app.id, e.target.value)}
                        onBlur={(e) => handleNotesUpdate(app.id, e.target.value)}
                        placeholder="Add notes..."
                        className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none resize-none"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={(app.marketplace_opportunities as any)?.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        View →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Share Your Experience</h2>
            <p className="text-slate-600 mb-4">
              Congratulations on closing a deal! Would you be willing to share a brief testimonial about your experience on Merchant Bridge?
            </p>
            <textarea
              rows={4}
              value={testimonialText}
              onChange={(e) => setTestimonialText(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleTestimonialSubmit}
                disabled={!testimonialText.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                Submit Testimonial
              </button>
              <button
                onClick={() => {
                  setShowTestimonialModal(false);
                  setTestimonialText('');
                  setSelectedApplication(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
