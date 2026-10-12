'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('marketplace_testimonials')
      .select('*, marketplace_merchant_profiles(business_name, product_category)')
      .order('submitted_at', { ascending: false });

    setTestimonials(data || []);
    setLoading(false);
  };

  const handleStatusChange = async (testimonialId: string, newStatus: string) => {
    const response = await fetch(`/api/admin/testimonials/${testimonialId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      loadTestimonials();
    } else {
      alert('Failed to update testimonial');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Testimonials & Case Studies</h1>
          <p className="text-slate-600">Manage merchant testimonials and case studies</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {testimonials.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No testimonials yet</h2>
            <p className="text-slate-600">
              Testimonials will appear here when merchants submit them after closing deals.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {testimonial.merchant_display_name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {(testimonial.marketplace_merchant_profiles as any)?.business_name} • 
                      {(testimonial.marketplace_merchant_profiles as any)?.product_category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      testimonial.status === 'featured'
                        ? 'bg-purple-100 text-purple-700'
                        : testimonial.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : testimonial.status === 'archived'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {testimonial.status}
                    </span>
                    {testimonial.is_case_study && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        Case Study
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-500 mb-1">Service/Opportunity</p>
                  <p className="text-slate-900">{testimonial.service_or_opportunity}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-500 mb-1">Testimonial</p>
                  <p className="text-slate-900 italic">"{testimonial.testimonial_text}"</p>
                </div>

                {testimonial.star_rating && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-500 mb-1">Rating</p>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < testimonial.star_rating ? 'text-yellow-400' : 'text-slate-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                )}

                {testimonial.is_case_study && (
                  <div className="mb-4 bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Case Study Details</h4>
                    <div className="space-y-2 text-sm">
                      {testimonial.situation_before && (
                        <div>
                          <p className="font-medium text-slate-500">Situation Before:</p>
                          <p className="text-slate-900">{testimonial.situation_before}</p>
                        </div>
                      )}
                      {testimonial.opportunities_found && (
                        <div>
                          <p className="font-medium text-slate-500">Opportunities Found:</p>
                          <p className="text-slate-900">{testimonial.opportunities_found}</p>
                        </div>
                      )}
                      {testimonial.services_used && (
                        <div>
                          <p className="font-medium text-slate-500">Services Used:</p>
                          <p className="text-slate-900">{testimonial.services_used}</p>
                        </div>
                      )}
                      {testimonial.specific_result && (
                        <div>
                          <p className="font-medium text-slate-500">Specific Result:</p>
                          <p className="text-slate-900">{testimonial.specific_result}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    Submitted: {new Date(testimonial.submitted_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    {testimonial.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(testimonial.id, 'approved')}
                          className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(testimonial.id, 'featured')}
                          className="px-3 py-1 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition"
                        >
                          Feature
                        </button>
                      </>
                    )}
                    {testimonial.status === 'approved' && (
                      <button
                        onClick={() => handleStatusChange(testimonial.id, 'featured')}
                        className="px-3 py-1 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition"
                      >
                        Feature
                      </button>
                    )}
                    {testimonial.status !== 'archived' && (
                      <button
                        onClick={() => handleStatusChange(testimonial.id, 'archived')}
                        className="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
