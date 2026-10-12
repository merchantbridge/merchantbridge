import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminOpportunitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const { data: opportunities } = await supabase
    .from('marketplace_opportunities')
    .select('*')
    .order('added_at', { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Opportunity Management</h1>
            <p className="text-slate-600">Add and manage marketplace opportunities</p>
          </div>
          <Link
            href="/admin/opportunities/new"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
          >
            Add Opportunity
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Source</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Expiry</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Matched</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {opportunities?.map((opp) => (
                <tr key={opp.id} className="border-b border-slate-200">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{opp.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{opp.opportunity_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{opp.source_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      opp.status === 'live'
                        ? 'bg-green-100 text-green-700'
                        : opp.status === 'expiring_soon'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {opp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">
                      {opp.expiry_date ? new Date(opp.expiry_date).toLocaleDateString() : 'No expiry'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{opp.merchants_shown || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/opportunities/${opp.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
