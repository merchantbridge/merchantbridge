'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const stages = ['identified', 'contacted', 'in_conversation', 'proposal_sent', 'service_agreed', 'completed', 'lost'];

export default function UpsellPipelinePage() {
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    merchant_id: '',
    service_type: '',
    potential_value: '',
    stage: 'identified',
    notes: '',
  });

  const loadPipeline = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('marketplace_upsell_pipeline')
      .select('*, marketplace_merchant_profiles(business_name, product_category)')
      .order('created_at', { ascending: false });

    setPipeline(data || []);
    setLoading(false);
  };


  useEffect(() => {
    loadPipeline();
  }, []);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/admin/upsell-pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    });

    if (response.ok) {
      setShowAddModal(false);
      setNewEntry({ merchant_id: '', service_type: '', potential_value: '', stage: 'identified', notes: '' });
      loadPipeline();
    } else {
      alert('Failed to add entry');
    }
  };

  const handleStageChange = async (entryId: string, newStage: string) => {
    const response = await fetch(`/api/admin/upsell-pipeline/${entryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    });

    if (response.ok) {
      loadPipeline();
    } else {
      alert('Failed to update stage');
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const response = await fetch(`/api/admin/upsell-pipeline/${entryId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      loadPipeline();
    } else {
      alert('Failed to delete entry');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  const stageGroups = stages.reduce((acc, stage) => {
    acc[stage] = pipeline.filter((entry) => entry.stage === stage);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Upsell Pipeline</h1>
              <p className="text-slate-600">Track specialist conversations and service opportunities</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              Add Entry
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stages.map((stage) => (
            <div key={stage} className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 capitalize">
                {stage.replace(/_/g, ' ')}
                <span className="ml-2 text-slate-400">({stageGroups[stage]?.length || 0})</span>
              </h3>
              
              <div className="space-y-3">
                {stageGroups[stage]?.map((entry) => (
                  <div key={entry.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <p className="font-medium text-slate-900 text-sm">
                      {(entry.marketplace_merchant_profiles as any)?.business_name || 'Unknown Merchant'}
                    </p>
                    {entry.service_type && (
                      <p className="text-xs text-slate-500 mt-1">{entry.service_type}</p>
                    )}
                    {entry.potential_value && (
                      <p className="text-xs text-slate-500">${entry.potential_value}</p>
                    )}
                    {entry.notes && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">{entry.notes}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <select
                        value={entry.stage}
                        onChange={(e) => handleStageChange(entry.id, e.target.value)}
                        className="text-xs rounded border border-slate-300 px-2 py-1"
                      >
                        {stages.map((s) => (
                          <option key={s} value={s} className="capitalize">
                            {s.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                
                {stageGroups[stage]?.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No entries</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add Pipeline Entry</h2>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Merchant ID</label>
                <input
                  type="text"
                  value={newEntry.merchant_id}
                  onChange={(e) => setNewEntry({ ...newEntry, merchant_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Service Type</label>
                <input
                  type="text"
                  value={newEntry.service_type}
                  onChange={(e) => setNewEntry({ ...newEntry, service_type: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Potential Value</label>
                <input
                  type="text"
                  value={newEntry.potential_value}
                  onChange={(e) => setNewEntry({ ...newEntry, potential_value: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Stage</label>
                <select
                  value={newEntry.stage}
                  onChange={(e) => setNewEntry({ ...newEntry, stage: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                >
                  {stages.map((stage) => (
                    <option key={stage} value={stage} className="capitalize">
                      {stage.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  rows={3}
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                >
                  Add Entry
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
