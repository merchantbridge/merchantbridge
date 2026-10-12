'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SourcingTrackerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const response = await fetch('/api/admin/sourcing-tracker');
    const result = await response.json();
    setData(result);
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  const weeklyTarget = 50;
  const weeklyProgress = Math.min(((data?.weeklyOpportunities || 0) / weeklyTarget) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Opportunity Sourcing Tracker</h1>
          <p className="text-slate-600">Track opportunity sourcing performance</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* This Week's Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">This Week</h2>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                {data?.weeklyOpportunities || 0} / {weeklyTarget} opportunities
              </span>
              <span className="text-sm text-slate-500">{Math.round(weeklyProgress)}%</span>
            </div>
            <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${weeklyProgress >= 100 ? 'bg-green-600' : 'bg-indigo-600'}`}
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
          </div>

          {weeklyProgress < 100 && (
            <p className="text-sm text-amber-600">
              {weeklyTarget - (data?.weeklyOpportunities || 0)} more opportunities needed to hit target
            </p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Type Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Breakdown by Type</h2>
            
            {data?.typeBreakdown && Object.keys(data.typeBreakdown).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(data.typeBreakdown).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">{type}</span>
                    <span className="text-sm font-medium text-slate-900">{count as number}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No data this week</p>
            )}
          </div>

          {/* Source Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Breakdown by Source</h2>
            
            {data?.sourceBreakdown && Object.keys(data.sourceBreakdown).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(data.sourceBreakdown).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">{source}</span>
                    <span className="text-sm font-medium text-slate-900">{count as number}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No data this week</p>
            )}
          </div>
        </div>

        {/* Historical Data */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Historical Performance (Last 8 Weeks)</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Week</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Date Range</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Opportunities</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">vs Target</th>
                </tr>
              </thead>
              <tbody>
                {data?.historicalData?.map((week: any) => (
                  <tr key={week.week} className="border-b border-slate-100">
                    <td className="px-4 py-3 text-sm text-slate-900">{week.week} weeks ago</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {week.startDate} - {week.endDate}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{week.count}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${
                        week.count >= weeklyTarget ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {week.count >= weeklyTarget ? '+' : ''}{week.count - weeklyTarget}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
