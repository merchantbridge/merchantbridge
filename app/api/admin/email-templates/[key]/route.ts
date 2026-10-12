import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const { data: teamMember } = await supabase
    .from('marketplace_team_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .eq('is_active', true)
    .single();

  if (!teamMember) {
    return Response.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  const { data: template } = await supabase
    .from('marketplace_email_templates')
    .select('*')
    .eq('template_key', params.key)
    .single();

  if (!template) {
    return Response.json({ error: 'Template not found' }, { status: 404 });
  }

  return Response.json(template);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const { data: teamMember } = await supabase
    .from('marketplace_team_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .eq('is_active', true)
    .single();

  if (!teamMember) {
    return Response.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  const body = await request.json();

  const { error } = await supabase
    .from('marketplace_email_templates')
    .update({
      ...body,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('template_key', params.key);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/admin/settings');

  return Response.json({ success: true });
}
