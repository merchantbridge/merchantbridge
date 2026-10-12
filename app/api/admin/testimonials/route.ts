import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is a team member
  const { data: teamMember } = await supabase
    .from('marketplace_team_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (!teamMember) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: testimonials } = await supabase
    .from('marketplace_testimonials')
    .select('*, marketplace_merchant_profiles(business_name, product_category)')
    .order('submitted_at', { ascending: false });

  return Response.json(testimonials || []);
}
