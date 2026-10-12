import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(
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

  const contentType = request.headers.get('content-type');
  let note = '';

  if (contentType?.includes('application/json')) {
    const body = await request.json();
    note = body.note;
  } else if (contentType?.includes('multipart/form-data') || contentType?.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    note = formData.get('note') as string;
  }

  if (!note) {
    return Response.json({ error: 'Note is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('marketplace_internal_notes')
    .insert({
      merchant_id: params.id,
      note,
      created_by: user.id,
    });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  revalidatePath(`/admin/merchants/${params.id}`);

  return Response.json({ success: true });
}
