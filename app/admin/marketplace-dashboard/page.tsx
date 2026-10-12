import { createClient } from '@/lib/supabase/server';

export default async function TeamDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  // Get platform stats
  const [{ count: totalMerchants }] = await Promise.all([
    supabase.from('marketplace_merchant_profiles').select('*', { count: 'exact', head: true }),
  ]);

  const [{ count: pendingProfiles }] = await Promise.all([
    supabase.from('marketplace_merchant_profiles').select('*', { count: 'exact', head: true }).eq('profile_status', 'pending'),
  ]);

  const [{ count: liveOpportunities }] = await Promise.all([
    supabase.from('marketplace_opportunities').select('*', { count: 'exact', head: true }).eq('status', 'live'),
  ]);

  const [{ count: thisWeekSignups }] = await Promise.all([
    supabase.from('marketplace_merchant_profiles').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  // Get action items
  const { data: pendingMerchants } = await supabase
    .from('marketplace_merchant_profiles')
    .select('id, business_name, product_category, submitted_at')
    .eq('profile_status', 'pending')
    .order('submitted_at', { ascending: true })
    .limit(5);

  const { data: expiringOpportunities } = await supabase
    .from('marketplace_opportunities')
    .select('id, title, expiry_date')
    .eq('status', 'live')
    .lte('expiry_date', new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString())
    .limit(5);

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from('marketplace_activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // Get weekly opportunity count
  const [{ count: weeklyOpportunities }] = await Promise.all([
    supabase.from('marketplace_opportunities').select('*', { count: 'exact', head: true })
      .gte('added_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const weeklyTarget = 50;
  const weeklyProgress = Math.min(((weeklyOpportunities || 0) / weeklyTarget) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Team Dashboard</h1>
          <p className="text-slate-600">Platform overview and action items</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Area 1: Platform Overview Stats */}
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-500">Total Merchants</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{totalMerchants || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-500">New This Week</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{thisWeekSignups || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-500">Pending Review</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">{pendingProfiles || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-500">Live Opportunities</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{liveOpportunities || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-500">Applications</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">-</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-500">Deals Closed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">-</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Area 2: Action Items */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Action Items</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Profiles Waiting for Review</h3>
                {pendingMerchants && pendingMerchants.length > 0 ? (
                  <div className="space-y-2">
                    {pendingMerchants.map((merchant) => (
                      <div key={merchant.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{merchant.business_name}</p>
                          <p className="text-xs text-slate-500">{merchant.product_category}</p>
                        </div>
                        <a
                          href={`/admin/review-queue`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Review →
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No pending profiles</p>
                )}
              </div>

              {expiringOpportunities && expiringOpportunities.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Opportunities Expiring Soon</h3>
                  <div className="space-y-2">
                    {expiringOpportunities.map((opp) => (
                      <div key={opp.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{opp.title}</p>
                          <p className="text-xs text-slate-500">
                            Expires: {new Date(opp.expiry_date).toLocaleDateString()}
                          </p>
                        </div>
                        <a
                          href={`/admin/opportunities`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Manage →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Area 4: Weekly Opportunity Target */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Weekly Opportunity Target</h2>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">
                  {weeklyOpportunities || 0} / {weeklyTarget} opportunities
                </span>
                <span className="text-sm text-slate-500">{Math.round(weeklyProgress)}%</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${weeklyProgress >= 100 ? 'bg-green-600' : 'bg-indigo-600'}`}
                  style={{ width: `${weeklyProgress}%` }}
                />
              </div>
            </div>

            {weeklyProgress < 100 && (
              <a
                href="/admin/opportunities"
                className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
              >
                Add Opportunities
              </a>
            )}
          </div>
        </div>

        {/* Area 3: Recent Activity Feed */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
          
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 border-b border-slate-100 last:border-0">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.action_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No recent activity</p>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <a
            href="/admin/merchants"
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition"
          >
            <h3 className="font-semibold text-slate-900">Merchant Management</h3>
            <p className="text-sm text-slate-500 mt-1">View and manage all merchants</p>
          </a>
          <a
            href="/admin/opportunities"
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition"
          >
            <h3 className="font-semibold text-slate-900">Opportunity Management</h3>
            <p className="text-sm text-slate-500 mt-1">Add and manage opportunities</p>
          </a>
          <a
            href="/admin/review-queue"
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition"
          >
            <h3 className="font-semibold text-slate-900">Review Queue</h3>
            <p className="text-sm text-slate-500 mt-1">Review pending merchant profiles</p>
          </a>
          <a
            href="/admin/testimonials"
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition"
          >
            <h3 className="font-semibold text-slate-900">Testimonials</h3>
            <p className="text-sm text-slate-500 mt-1">Manage testimonials and case studies</p>
          </a>
        </div>
      </main>
    </div>
  );
}
