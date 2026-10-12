'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ReviewQueuePage() {
  const [pendingProfiles, setPendingProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; profileId: string | null; reason: string }>({
    open: false,
    profileId: null,
    reason: '',
  });

  useEffect(() => {
    loadPendingProfiles();
  }, []);

  const loadPendingProfiles = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('marketplace_merchant_profiles')
      .select('*')
      .eq('profile_status', 'pending')
      .order('submitted_at', { ascending: true });

    setPendingProfiles(data || []);
    setLoading(false);
  };

  const handleResubmit = async (e: React.FormEvent<HTMLFormElement>, profileId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const feedback = formData.get('feedback');
    if (!feedback) {
      alert('Please enter feedback');
      return;
    }

    const response = await fetch(`/api/admin/review-queue/${profileId}/resubmit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback }),
    });

    if (response.ok) {
      loadPendingProfiles();
    } else {
      alert('Failed to request resubmission');
    }
  };

  const handleReject = async () => {
    if (!rejectModal.profileId || !rejectModal.reason) {
      alert('Please enter a reason for rejection');
      return;
    }

    const response = await fetch(`/api/admin/review-queue/${rejectModal.profileId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: rejectModal.reason }),
    });

    if (response.ok) {
      setRejectModal({ open: false, profileId: null, reason: '' });
      loadPendingProfiles();
    } else {
      alert('Failed to reject profile');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Profile Review Queue</h1>
          <p className="text-slate-600">Review pending merchant profiles</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {pendingProfiles.length > 0 ? (
          <div className="space-y-6">
            {pendingProfiles.map((profile) => (
              <div key={profile.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{profile.business_name}</h2>
                    <p className="text-slate-600">{profile.full_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Category: {profile.product_category}</p>
                    <p className="text-sm text-slate-500">
                      Waiting: {Math.round((Date.now() - new Date(profile.submitted_at).getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mb-6">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Business Description</p>
                    <p className="text-slate-900">{profile.business_description}</p>
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
                </div>

                <div className="flex gap-3 flex-wrap">
                  <form
                    action={`/api/admin/review-queue/${profile.id}/approve`}
                    method="POST"
                  >
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                  </form>
                  <form
                    onSubmit={(e) => handleResubmit(e, profile.id)}
                    className="flex-1 min-w-[300px]"
                  >
                    <input
                      type="text"
                      name="feedback"
                      placeholder="Enter feedback for resubmission..."
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                    <button
                      type="submit"
                      className="mt-2 w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                    >
                      Request Resubmission
                    </button>
                  </form>
                  <button
                    onClick={() => setRejectModal({ open: true, profileId: profile.id, reason: '' })}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                  <a
                    href={`/admin/merchants/${profile.id}`}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition inline-block text-center h-10 leading-10"
                  >
                    View Full Profile
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">All caught up!</h2>
            <p className="text-slate-600">No profiles waiting for review</p>
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Reject Profile</h2>
            <p className="text-slate-600 mb-4">
              Please provide a reason for rejecting this profile. This will be shared with the merchant.
            </p>
            <textarea
              rows={4}
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="Enter reason for rejection..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={!rejectModal.reason}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                Reject Profile
              </button>
              <button
                onClick={() => setRejectModal({ open: false, profileId: null, reason: '' })}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
