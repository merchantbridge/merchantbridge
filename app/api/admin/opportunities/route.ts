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

  const { data: opportunities } = await supabase
    .from('marketplace_opportunities')
    .select('*')
    .order('added_at', { ascending: false });

  return Response.json(opportunities || []);
}

export async function POST(request: NextRequest) {
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

  const body = await request.json();

  const { data, error } = await supabase
    .from('marketplace_opportunities')
    .insert({
      ...body,
      added_by: user.id,
      added_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from('marketplace_activity_log').insert({
    actor_id: user.id,
    actor_type: 'team_member',
    action_type: 'opportunity_added',
    action_details: { opportunity_id: data.id, title: body.title },
    target_type: 'opportunity',
    target_id: data.id,
  });

  revalidatePath('/admin/opportunities');
  revalidatePath('/admin/marketplace-dashboard');

  return Response.json(data);
}
