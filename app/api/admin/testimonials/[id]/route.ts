import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const { error } = await supabase
    .from('marketplace_testimonials')
    .update({
      ...body,
      reviewed_at: body.status !== 'pending' ? new Date().toISOString() : null,
      featured_at: body.status === 'featured' ? new Date().toISOString() : null,
    })
    .eq('id', params.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/admin/testimonials');

  return Response.json({ success: true });
}
