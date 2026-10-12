import { createClient } from '@/lib/supabase/server';

export default async function AdminMerchantsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const { data: merchants } = await supabase
    .from('marketplace_merchant_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Merchant Management</h1>
          <p className="text-slate-600">View and manage all merchants on the platform</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Merchant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Signed Up</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Applications</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {merchants?.map((merchant) => (
                <tr key={merchant.id} className="border-b border-slate-200">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{merchant.business_name}</p>
                      <p className="text-sm text-slate-500">{merchant.full_name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{merchant.product_category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      merchant.profile_status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : merchant.profile_status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : merchant.profile_status === 'resubmit_requested'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {merchant.profile_status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">
                      {new Date(merchant.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{merchant.applications_submitted || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <a
                        href={`/admin/merchants/${merchant.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        View
                      </a>
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
