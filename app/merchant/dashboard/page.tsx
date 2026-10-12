import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function MerchantDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Get merchant profile
  const { data: profile } = await supabase
    .from('marketplace_merchant_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // If no profile, redirect to onboarding
  if (!profile) {
    redirect('/merchant/onboarding');
  }

  // If profile is pending, show holding screen
  if (profile.profile_status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Profile Under Review
            </h1>

            <p className="text-slate-600 mb-6">
              Your profile is currently under review by our team. We'll get back to you within 48 hours.
            </p>

            <p className="text-sm text-slate-500">
              Submitted: {new Date(profile.submitted_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If profile is resubmit requested, show feedback
  if (profile.profile_status === 'resubmit_requested') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Update Your Profile
            </h1>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-amber-800 mb-2">Feedback from our team:</p>
              <p className="text-sm text-amber-700">{profile.review_feedback}</p>
            </div>

            <p className="text-slate-600 mb-6">
              Please update your profile based on the feedback above and resubmit for review.
            </p>

            <a
              href="/merchant/profile"
              className="inline-block w-full px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition text-center"
            >
              Update Profile
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If profile is rejected
  if (profile.profile_status === 'rejected') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Application Not Approved
            </h1>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-slate-700">{profile.review_feedback}</p>
            </div>

            <p className="text-slate-600">
              Thank you for your interest in Merchant Bridge.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get matched opportunities (limit to 3 for preview)
  const { data: opportunities } = await supabase
    .from('marketplace_opportunities')
    .select('*')
    .eq('status', 'live')
    .contains('matching_categories', [profile.product_category])
    .order('added_at', { ascending: false })
    .limit(3);

  // Get applications
  const { data: applications } = await supabase
    .from('marketplace_applications')
    .select('*, marketplace_opportunities(*)')
    .eq('merchant_id', profile.id)
    .order('applied_at', { ascending: false })
    .limit(5);

  // Get unread notifications
  const { data: notifications } = await supabase
    .from('marketplace_notifications')
    .select('*')
    .eq('merchant_id', profile.id)
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back, {profile.full_name}
              </h1>
              <p className="text-slate-600">{profile.business_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/merchant/profile"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Edit Profile
              </a>
              <a
                href="/auth/sign-out"
                className="text-sm font-medium text-slate-600 hover:text-slate-700"
              >
                Sign Out
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Area 1: Opportunity Feed Preview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Opportunities
              </h2>
              <a
                href="/merchant/opportunities"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all →
              </a>
            </div>

            {opportunities && opportunities.length > 0 ? (
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {opportunity.opportunity_type}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(opportunity.added_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {opportunity.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      {opportunity.short_description}
                    </p>
                    <a
                      href={opportunity.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      View opportunity →
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-2">
                  We're actively sourcing opportunities in your category.
                </p>
                <p className="text-sm text-slate-500">
                  Check back soon for new matches.
                </p>
              </div>
            )}
          </div>

          {/* Area 2: Profile Completion */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Profile Completion
            </h2>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">
                  {profile.profile_completion_percentage}% Complete
                </span>
                <span className="text-xs text-slate-500">
                  {profile.profile_completion_percentage < 100
                    ? 'Complete your profile for better matches'
                    : 'Great job! Your profile is complete.'}
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all"
                  style={{ width: `${profile.profile_completion_percentage}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Business Description</span>
                <span className={profile.business_description ? 'text-green-600' : 'text-slate-400'}>
                  {profile.business_description ? '✓' : 'Add'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Shipping Markets</span>
                <span className={profile.shipping_markets?.length > 0 ? 'text-green-600' : 'text-slate-400'}>
                  {profile.shipping_markets?.length > 0 ? '✓' : 'Add'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Revenue Range</span>
                <span className={profile.monthly_revenue_range ? 'text-green-600' : 'text-slate-400'}>
                  {profile.monthly_revenue_range ? '✓' : 'Add'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Sales Channels</span>
                <span className={profile.sales_channels?.length > 0 ? 'text-green-600' : 'text-slate-400'}>
                  {profile.sales_channels?.length > 0 ? '✓' : 'Add'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Trade Deck</span>
                <span className={profile.has_trade_deck ? 'text-green-600' : 'text-amber-600'}>
                  {profile.has_trade_deck ? '✓' : 'Required'}
                </span>
              </div>
            </div>

            {profile.profile_completion_percentage < 100 && (
              <a
                href="/merchant/profile"
                className="mt-4 inline-block w-full px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition text-center"
              >
                Complete Profile
              </a>
            )}
          </div>

          {/* Area 3: Application Tracker */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Your Applications
              </h2>
              <a
                href="/merchant/applications"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all →
              </a>
            </div>

            {applications && applications.length > 0 ? (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="border border-slate-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-slate-900">
                        {(app.marketplace_opportunities as any)?.title || 'Unknown Opportunity'}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          app.application_status === 'deal_closed'
                            ? 'bg-green-100 text-green-700'
                            : app.application_status === 'in_conversation'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {app.application_status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-2">
                  You haven't applied to any opportunities yet.
                </p>
                <a
                  href="/merchant/opportunities"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Browse opportunities →
                </a>
              </div>
            )}
          </div>

          {/* Area 4: Notifications */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Notifications
                {notifications && notifications.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </h2>
              <a
                href="/merchant/notifications"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all →
              </a>
            </div>

            {notifications && notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="border-l-4 border-indigo-500 bg-slate-50 rounded-r-lg p-4"
                  >
                    <h3 className="font-medium text-slate-900 mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600">
                  No new notifications
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
