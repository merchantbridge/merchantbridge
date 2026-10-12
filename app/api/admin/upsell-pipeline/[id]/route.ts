import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const updates: any = {
    ...body,
    updated_at: new Date().toISOString(),
  };

  if (body.stage === 'completed' || body.stage === 'lost') {
    updates.closed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('marketplace_upsell_pipeline')
    .update(updates)
    .eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/admin/upsell-pipeline');

  return Response.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { error } = await supabase
    .from('marketplace_upsell_pipeline')
    .delete()
    .eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/admin/upsell-pipeline');

  return Response.json({ success: true });
}
